
import { Console } from "console";
import { CloudCog } from "lucide-react";
import { NextApiRequest, NextApiResponse } from "next";

//
// 1) Define your environment variables & base URL
//
const API_KEY = process.env.API_KEY!;
// const BKP_API_KEY = process.env.BKP_API_KEY; // Backup API Key
const FORM_ID = process.env.FORM_ID!;
const BASE_URL = process.env.BASE_URL!;



//
// 2) Create a helper function that tries primaryKey first,
//    and if it gets a 401, retries using the backupKey (if defined).
//
async function fetchWithFallback(url: string, primaryKey: string, ) {
  // First attempt: replace {API_KEY} placeholder with primaryKey
  let response = await fetch(url.replace("{API_KEY}", primaryKey));

  // If 401 and backupKey is available, retry with backup
  // if (response.status === 401 && backupKey) {
  //   console.warn("🔀");
  //   response = await fetch(url.replace("{API_KEY}", backupKey));
  // }

  // Return final response (could be successful or still 401, etc.)
  return response;
}

//
// 3) Interfaces, parsing logic, and approval flow – unchanged
//

// Each item from "/inbox/submission/{id}/thread"
interface ThreadItem {
  actionType: string; // e.g. "APPROVE_REJECT" / "MULTIPLE_APPROVE_REJECT"
  timestamp: string;
  user?: {
    email?: string;
  };
  actionDetails?: {
    outcomeID?: string | number; // e.g. "1"=Approve, "2"=Custom Deny, etc.
    type?: string;
    comment?: string | null;
    assigneeEmail?: string;
  };
}

interface Submission {
  id: string;
  answers: {
    [key: string]: {
      answer: string;
    };
  };
}

function parseApprovals(threadData: { content?: ThreadItem[] }) {
  if (!threadData?.content) return [];

  // Include both normal and multi-approver items
  const approvalActions = threadData.content.filter(
    (item) =>
      (item.actionType === "APPROVE_REJECT" ||
        item.actionType === "MULTIPLE_APPROVE_REJECT") &&
      item.actionDetails?.outcomeID !== undefined
  );

  // Sort ascending by timestamp (earliest first)
  approvalActions.sort((a, b) => {
    const tA = new Date(a.timestamp).getTime();
    const tB = new Date(b.timestamp).getTime();
    return tA - tB;
  });
  return approvalActions;
}

type StageStatus = "PENDING" | "APPROVED" | "DENIED" | "EXPIRED";
type OverallStatus = "IN_PROGRESS" | "APPROVED" | "DENIED" | "EXPIRED";

interface Stage {
  role: string;
  email?: string;
}

/**
 * Determines the final stage statuses + overall status
 */
function determineApprovalStatus(
  approvalActions: ThreadItem[],
  stages: Stage[]
) {
  // Initialize all stages to PENDING

  console.log(approvalActions, "approvalActions >>>>> ")
  const approvals: Record<string, StageStatus> = {};
  stages.forEach((s) => (approvals[s.role] = "PENDING"));

  let overallStatus: OverallStatus = "IN_PROGRESS";
  let denialComment: string | null = null;

  // For each approval/rejection action
  for (const action of approvalActions) {
    const userEmail = (action.actionDetails?.assigneeEmail || "").toLowerCase();
    let outcomeID = action.actionDetails?.outcomeID;
    if (typeof outcomeID === "string") {
      outcomeID = parseInt(outcomeID);
    }
    const comment = action.actionDetails?.comment || "";
    console.log(outcomeID , userEmail, "outcomeID >>>>> ")
    // Attempt to find stage by email or assigneeEmail
    let stageIndex = stages.findIndex(
      (s) => (s.email || "").toLowerCase() === userEmail
    );
    console.log(stageIndex, "stageIndex >>>>> ")
    if (stageIndex === -1 && action.actionDetails?.assigneeEmail) {
      const assignedEmail = action.actionDetails.assigneeEmail.toLowerCase();
      stageIndex = stages.findIndex(
        (s) => (s.email || "").toLowerCase() === assignedEmail
      );
    }

    // If system triggered expiry
    const isWorkflowSystem =
      userEmail.includes("workflowsystem") ||
      userEmail.startsWith("!workflow_system");

    // 1) If system auto-denied (outcomeID=2 or 4), set overallStatus=DENIED (no blame)
    if (isWorkflowSystem && (outcomeID === 2 || outcomeID === 4)) {
      overallStatus = "DENIED";
      denialComment = "🚫 AUTO DECLINED BY SYSTEM WRT SOP";
      break;
    }

    // 2) If no matching stage but outcome=3 (Expired) from system, expire the next pending stage
    if (stageIndex === -1 && outcomeID === 3 && isWorkflowSystem) {
      stageIndex = stages.findIndex((s) => approvals[s.role] === "PENDING");
    }

    // 3) Multi‐approver fallback: if still no match but action is MULTIPLE_APPROVE_REJECT,
    //    e.g. an IT user who’s different from the single form email.
    if (stageIndex === -1 && action.actionType === "MULTIPLE_APPROVE_REJECT") {
      // Example fallback: find the next pending IT stage
      stageIndex = stages.findIndex(
        (s) => approvals[s.role] === "PENDING" && s.role === "IT"
      );
    }

    // 4) If we still have no stageIndex, skip this action
    if (stageIndex === -1) {
      continue;
    }

    // Apply outcome
    if (outcomeID === 1) {
      // Approved
      approvals[stages[stageIndex].role] = "APPROVED";
    } else if (outcomeID === 3) {
      // Expired
      approvals[stages[stageIndex].role] = "EXPIRED";
      overallStatus = "EXPIRED";
      denialComment = comment;
      break;
    } else if (outcomeID === 2 || outcomeID === 4) {
      // Denied
      approvals[stages[stageIndex].role] = "DENIED";
      overallStatus = "DENIED";
      denialComment = comment;
      break;
    }
  }

  // If not expired/denied, check if all stages are approved
  if (overallStatus !== "EXPIRED" && overallStatus !== "DENIED") {
    
    const allApproved = stages.every((s) => approvals[s.role] === "APPROVED");
     console.log(allApproved, "allApproved >>>>> ")
    overallStatus = allApproved ? "APPROVED" : "IN_PROGRESS";
  }

  // Identify next pending approver if still in progress
  let currentApprover = "";
  let currentApproverEmail = "";
  if (overallStatus === "IN_PROGRESS") {
    const pendingStage = stages.find((s) => approvals[s.role] === "PENDING");
    if (pendingStage) {
      
    
      currentApprover = pendingStage.role;
      currentApproverEmail = pendingStage.email || "";
      console.log(currentApprover, "overallStatus >>>>> ")
    }
   
  }


  return {
    approvals,
    overallStatus,
    currentApprover,
    currentApproverEmail,
    denialComment,
  };
}

/**
 * Grabs a single submission's details + approval thread,
 * returning a structured object with stage statuses, etc.
 */
async function getSubmissionDetails(submissionId: string) {
  try {
    // 1) Fetch the submission, using the fallback helper
    const submissionResponse = await fetchWithFallback(
      `${BASE_URL}/submission/${submissionId}?apikey={API_KEY}`,
      API_KEY,
      // BKP_API_KEY
    );
    if (!submissionResponse.ok) {
      throw new Error("Failed to fetch submission details");
    }
    const submissionData = await submissionResponse.json();
    if (!submissionData.content) {
      throw new Error("No submission details found");
    }

    const submission = submissionData.content;
    const answers = submission.answers || {};

    // 2) Fetch the approval thread
    const threadResponse = await fetchWithFallback(
      `${BASE_URL}/inbox/submission/${submissionId}/thread?apikey={API_KEY}`,
      API_KEY,
      // BKP_API_KEY
    );
    if (!threadResponse.ok) {
      throw new Error("Failed to fetch approval thread");
    }
    const threadData = await threadResponse.json();

    // 2a) Decide whether we need an IT stage
    // const typeOfRequest = answers["12"]?.answer || "";
    const inventorySelected = answers["36"]?.answer || []; // e.g. ["Software","Apparel"]
    const needsIT =
      // typeOfRequest === "Replacement Request" ||
      (Array.isArray(inventorySelected) && inventorySelected.includes("Software"));

    // 2b) Build the stage array from form answers
    function buildApproverStages() {
      const stages: Stage[] = [
        { role: "BH", email: answers["50"]?.answer },
      ];
      // if (needsIT) {
      //   stages.push({ role: "IT", email: answers["41"]?.answer });
      // }
      stages.push({ role: "CTM", email: answers["68"]?.answer });
       stages.push({ role: "Finance", email: ""});
      return stages;
    }
    const approverStages = buildApproverStages();

    // 3) Extract only the relevant approval actions
    const approvalActions = parseApprovals(threadData);

    // 4) Determine final statuses
    const {
      approvals,
      overallStatus,
      currentApprover,
      currentApproverEmail,
      denialComment,
    } = determineApprovalStatus(approvalActions, approverStages);

    // 5) Additional parsing for "Replacement Request" or other categories
    let replacementDetails: unknown = undefined;
    const inventoryDetails: unknown[] = [];

    // if (typeOfRequest === "Replacement Request") {
    //   const rawRepl = answers["105"]?.answer || "[]";
    //   let replItems = [];
    //   try {
    //     replItems = JSON.parse(rawRepl);
    //   } catch (err) {
    //     console.error("Could not parse replacement items JSON:", err);
    //   }
    //   replacementDetails = {
    //     reason: answers["31"]?.answer || "",
    //     items: replItems,
    //   };
    // } else {
    //   const categories = Array.isArray(inventorySelected)
    //     ? inventorySelected
    //     : [inventorySelected];

    //   for (const cat of categories) {
    //     if (cat === "Electronics") {
    //       const raw = answers["24"]?.answer || "[]";
    //       let rows = [];
    //       try {
    //         rows = JSON.parse(raw);
    //       } catch (err) {
    //         console.error("Electronics parse error:", err);
    //       }
    //       inventoryDetails.push({
    //         categoryName: "Electronics",
    //         rows,
    //       });
    //     } else if (cat === "Apparel") {
    //       const raw = answers["23"]?.answer || "[]";
    //       let rows = [];
    //       try {
    //         rows = JSON.parse(raw);
    //       } catch (err) {
    //         console.error("Apparel parse error:", err);
    //       }
    //       inventoryDetails.push({
    //         categoryName: "Apparel",
    //         rows,
    //       });
    //     } else if (cat === "Others") {
    //       const raw = answers["47"]?.answer || "[]";
    //       let rows = [];
    //       try {
    //         rows = JSON.parse(raw);
    //       } catch (err) {
    //         console.error("Others parse error:", err);
    //       }
    //       inventoryDetails.push({
    //         categoryName: "Others",
    //         rows,
    //       });
    //     } else if (cat === "Software") {
    //       const raw = answers["22"]?.answer || "[]";
    //       let rows = [];
    //       try {
    //         rows = JSON.parse(raw);
    //       } catch (err) {
    //         console.error("Software parse error:", err);
    //       }
    //       inventoryDetails.push({
    //         categoryName: "Software",
    //         rows,
    //       });
    //     } else if (cat === "IT Asset") {
    //       const raw = answers["21"]?.answer || "[]";
    //       let rows = [];
    //       try {
    //         rows = JSON.parse(raw);
    //       } catch (err) {
    //         console.error("IT Asset parse error:", err);
    //       }
    //       inventoryDetails.push({
    //         categoryName: "IT Asset",
    //         rows,
    //       });
    //     }
    //     // add more categories as needed
    //   }
    // }

    // 6) Return structured data
    return {
      id: submission.id,
      department: answers["73"]?.answer || "Unknown",
      bhEmail: answers["50"]?.answer || "N/A",
      ctmEmail: answers["68"]?.answer || "N/A",
      centerName: answers["48"]?.answer || "N/A",
      paymentType: answers["29"]?.answer || "N/A",
      totalCost: answers["27"]?.answer || "N/A",
      testType: answers["28"]?.answer?.[0] || "N/A",
      // type: typeOfRequest,
      // inventoryType: Array.isArray(inventorySelected)
      //   ? inventorySelected
      //   : [inventorySelected],
      status:
        overallStatus === "APPROVED"
          ? "APPROVED"
          : overallStatus === "DENIED"
          ? "DENIED"
          : overallStatus === "EXPIRED"
          ? "EXPIRED"
          : "IN PROGRESS",
      currentApprover,
      currentApproverEmail,
      denialComment,
      approvals: {
        BH: approvals["BH"],
        CTM: approvals["CTM"],
        Finance: approvals["Finance"],
        // admin: approvals["Admin"],
      },
      // replacementDetails,
      // inventoryDetails,
    };
  } catch (error) {
    console.error("❌ Error fetching submission details:", error);
    throw error;
  }
}

//
// 4) Your Next.js API route handler – now using fetchWithFallback to fetch the form’s submissions
//
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  console.log(`${BASE_URL}/form/${FORM_ID}/submissions?apikey=${API_KEY}&limit=500` , "fetching url")
  try {
    const { requestId } = req.query;
    if (!requestId) {
      return res.status(400).json({ error: "Request ID is required" });
    }

    const response = await fetchWithFallback(`${BASE_URL}/form/${FORM_ID}/submissions?apikey=${API_KEY}&limit=500`,
      API_KEY,
      // BKP_API_KEY
    );
    // console.log(response.json(), "response")
    if (!response.ok) {
      throw new Error("Failed to fetch submissions");
    }
    const data = await response.json();
    // console.log(data, "response")
    if (!data?.content || !Array.isArray(data.content)) {
      return res.status(500).json({ error: "No valid submission data received." });
    }

    // 2) Among all submissions, find the one matching requestId (answer ID=40)
    const submission = data.content.find(
      (sub: Submission) => sub.answers?.["59"]?.answer === requestId
    );
    if (!submission) {
      return res.status(404).json({ error: "Request ID not found. Request might be old." });
    }

    // 3) Get the detailed breakdown (stages, approvals, etc.)
    const submissionDetails = await getSubmissionDetails(submission.id);

    // 4) Return final JSON
    return res.status(200).json(submissionDetails);
  } catch (error) {
    console.error("❌ Server Error:", error);
    return res.status(500).json({ error: (error as Error).message });
  }
}
