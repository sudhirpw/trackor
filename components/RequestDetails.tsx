// pair code 1.17

// src/components/RequestDetails.tsx

import React from "react";

// A generic row shape: each row is a record with arbitrary keys
// e.g. {"Items":"Laptop","Quantity":"1","Measurement":"meter"}
type InventoryRow = Record<string, string>;

// Each category has a name + array of row objects
type InventoryCategoryDetails = {
  categoryName: string;
  rows: InventoryRow[]; 
};

export interface  RequestData  {
  // Basic fields
  id: string;
  status: string;
  centerName: string;
  ctmEmail:string,
  bhEmail:string,
  totalCost: number;
  paymentType: string;
  testType:string,
  financeEmail?:string,
  // type: string;                // e.g. "Individual Request"
   inventoryType: string[];     // e.g. ["Electronics","Apparel","Others"]
  currentApprover: string;
  currentApproverEmail: string;
  denialComment?: string;
  approvals: {
    BH?: string;
    CTM?: string;
    FINANCE?: string;
    [key: string]: string | undefined;
  };
  comments:{
    BH?: string;
    CTM?: string;
    Finance?: string;
    [key: string]: string | undefined;
  }
  stageEmails?: Record<string, string>;

  // Inventory details for multiple categories
   inventoryDetails?: InventoryCategoryDetails[];

  // If it's a replacement request, you might also have:
  // replacementDetails?: ...
};

interface RequestDetailsProps {
  request: RequestData;
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ request }) => {
  // const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  console.log(request)
  if (!request) return null;

  const {
    //  inventoryType = [],
    approvals,
    denialComment,
    //  inventoryDetails = [],
  } = request;

  // const isReplacement = request.type === "Replacement Request";

  // Toggles the accordion: if you click the same category, it closes; otherwise open the new one
  // function handleToggle(index: number) {
  //   setExpandedIndex((prev) => (prev === index ? null : index));
  // }

  // Renders either the replacement details or the normal inventory categories
  // function renderInventorySection() {
  //   // if (isReplacement) {
  //   //   // If type = "Replacement Request," you’d show replacementDetails here
  //   //   return null;
  //   // }

  //   return (
  //     <div className="mt-6">
  //       <h3 className="text-lg font-semibold">Inventory Requested</h3>
  //       {inventoryType.length > 0 ? (
  //         <div className="flex flex-wrap gap-2 mt-2 mb-4">
  //           {inventoryType.map((cat, idx) => (
  //             <span key={idx} className="bg-gray-100 px-3 py-1 rounded-md text-sm">
  //               {cat}
  //             </span>
  //           ))}
  //         </div>
  //       ) : (
  //         <p className="text-red-600 mt-2">No items requested</p>
  //       )}

  //       <div className="border border-gray-300 rounded mt-4 overflow-hidden">
  //         {inventoryDetails.map((catDetail, i) => {
  //           const isOpen = expandedIndex === i;

  //           // 1) Category Header (click to expand/collapse)
  //           return (
  //             <div key={i}>
  //               <button
  //                 type="button"
  //                 onClick={() => handleToggle(i)}
  //                 className="w-full flex items-center justify-between 
  //                            px-4 py-3 bg-gray-100 hover:bg-gray-200 
  //                            focus:outline-none text-sm text-gray-700
  //                            font-medium"
  //               >
  //                 {/* Category Name */}
  //                 <span>{catDetail.categoryName}</span>
  //                 {/* Arrow Icon (rotate if open) */}
  //                 <svg
  //                   className={`w-5 h-5 transform transition-transform ${
  //                     isOpen ? "rotate-180" : ""
  //                   }`}
  //                   fill="none"
  //                   stroke="currentColor"
  //                   strokeWidth="2"
  //                   viewBox="0 0 24 24"
  //                 >
  //                   <path
  //                     strokeLinecap="round"
  //                     strokeLinejoin="round"
  //                     d="M19 9l-7 7-7-7"
  //                   />
  //                 </svg>
  //               </button>

  //               {/* 2) If open, show the table (with dynamic columns) */}
  //               {isOpen && (
  //                 <div className="px-4 pb-4 pt-2 bg-white border-t border-gray-200">
  //                   {renderTable(catDetail.rows)}
  //                 </div>
  //               )}
  //             </div>
  //           );
  //         })}
  //       </div>
  //     </div>
  //   );
  // }

  // Dynamically generate the table columns from the row keys
  // function renderTable(rows: InventoryRow[]) {
  //   if (!rows || rows.length === 0) {
  //     return <p className="text-sm text-gray-500">No items found.</p>;
  //   }
  //   // Use the keys from the first row as columns
  //   const headers = Object.keys(rows[0]);

  //   return (
  //     <div className="overflow-x-auto">
  //       <table className="min-w-full border border-gray-200">
  //         <thead className="bg-gray-50">
  //           <tr>
  //             {headers.map((header) => (
  //               <th
  //                 key={header}
  //                 className="text-xs font-bold text-gray-700 px-3 py-2 text-left border-b border-gray-200"
  //               >
  //                 {header}
  //               </th>
  //             ))}
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {rows.map((row, i) => (
  //             <tr key={i} className="border-b border-gray-200">
  //               {headers.map((header) => (
  //                 <td key={header} className="px-3 py-2 text-sm">
  //                   {row[header]}
  //                 </td>
  //               ))}
  //             </tr>
  //           ))}
  //         </tbody>
  //       </table>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        ✅ Request Details
      </h2>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <p className="text-gray-700">
          <strong>Center Name:</strong> {request.centerName || "N/A"}
        </p>
        <p className="text-gray-700">
          <strong>BH EMAIL:</strong> {request.bhEmail || "N/A"}
        </p>
        <p className="text-gray-700">
          <strong>BH Approval Status:</strong> {request.approvals.BH || "N/A"}
        </p>
        <p className="text-gray-700">
          <strong>BH Approval Comment:</strong> {request.comments.BH || "N/A"}
        </p>

        <p className="text-gray-700">
          <strong>CTM EMAIL:</strong> {request.ctmEmail || "N/A"}
        </p>
        <p className="text-gray-700">
          <strong>CTM Approval Status:</strong> {request.approvals.CTM || "N/A"}
        </p>
        <p className="text-gray-700">
          <strong>CTM Approval Comment:</strong> {request.comments.CTM || "N/A"}
        </p>
        <p className="text-gray-700">
          <strong>Finance Email:</strong> {request.financeEmail || "N/A"}
        </p>
        <p className="text-gray-700">
          <strong>Finance Approval Status:</strong> {request.approvals.FINANCE || "N/A"}
        </p>
        <p className="text-gray-700">
          <strong>Finance Approval Comment:</strong> {request.comments.Finance || "N/A"}
        </p>
        <p className="text-gray-700">
          <strong>Payment Type:</strong> {request.paymentType || "N/A"}
        </p>
        <p className="text-gray-700">
          <strong>Total Cost:</strong> {request.totalCost || "N/A"}
        </p>
        <p className="text-gray-700">
          <strong>Test Type:</strong> {request.testType || "N/A"}
        </p>
        <p className="text-gray-700">
          <strong>Pending Approval:</strong>{" "}
          {request.currentApprover || "Completed"}
        </p>
        {/* <p className="text-gray-700">
          <strong>Current Actor:</strong>
          {request.currentApproverEmail && (
            <a
              href={`mailto:${request.currentApproverEmail}`}
              className="text-blue-500 ml-1"
            >
              {request.currentApproverEmail}
            </a>
          )}
        </p> */}
      </div>

      {/* Inventory or Replacement Section */}
      {/* {renderInventorySection()} */}

      {/* Approval Timeline */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Approval Status</h3>
        <div className="flex justify-center space-x-20 mb-6">
          {["BH", "CTM", "FINANCE", ].map((role, index) => {
            console.log(approvals?.[role] , index , role)
            // Possibly skip IT if not needed, etc.
            const needsIT =
      // request.type === "Replacement Request" ||
      (Array.isArray(request.inventoryType) &&
       request.inventoryType.includes("Software"));

    if (role === "IT" && !needsIT) {
      return null; // Hide IT row
    }
            const stageStatus = approvals?.[role.toUpperCase()] || "PENDING";
            let labelText = "";
            let circleIcon: string | number = index +1;
            let circleClasses = "bg-gray-200 text-gray-600";

            const isCurrentApprover =
              request.status === "IN PROGRESS" &&
              stageStatus === "PENDING" &&
              role === request.currentApprover;

            switch (stageStatus) {
              case "APPROVED":
                labelText = "Approved";
                circleIcon = "✓";
                circleClasses = "bg-green-500 text-white";
                break;
              case "DENIED":
                labelText = "Denied";
                circleIcon = "✕";
                circleClasses = "bg-red-500 text-white";
                break;
              case "EXPIRED":
                labelText = "Expired";
                circleIcon = "!";
                circleClasses = "bg-orange-400 text-white";
                break;
              default:
                labelText = "Pending";
            }

            const hasFlowEnded =
              ["DENIED", "EXPIRED", "APPROVED"].includes(request.status);
            const isSkippedStage =
              hasFlowEnded &&
              stageStatus === "PENDING" &&
              (request.status === "DENIED" || request.status === "EXPIRED");
            const fadeClass = isSkippedStage ? "opacity-30 blur-[3px]" : "";

            function renderCircle() {
              if (!isCurrentApprover) {
                return (
                  <div
                    className={`w-10 h-10 flex items-center justify-center 
                                rounded-full font-medium text-sm 
                                transition-colors duration-200 
                                ${circleClasses}`}
                  >
                    {circleIcon}
                  </div>
                );
              }
              // Multi-circle pulse if current
              return (
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-300 opacity-75" />
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-300 opacity-75"
                    style={{ animationDelay: "3s" }}
                  />
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-300 opacity-75"
                    style={{ animationDelay: "3.15s" }}
                  />
                  <span className="relative inline-flex rounded-full h-10 w-10 bg-orange-400 text-white items-center justify-center font-medium text-sm">
                    {circleIcon}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={role}
                className={`flex flex-col items-center relative ${fadeClass}`}
                style={{ minWidth: "60px" }}
              >
                {index > 0 && (
                  <div
                    className="absolute w-[80px] h-[2px] bg-gray-200"
                    style={{ top: "50%", left: "-80px" }}
                  />
                )}
                <p className="mb-1 text-xs font-semibold">{labelText}</p>
                {renderCircle()}
                <p className="mt-1 text-sm font-medium">{role}</p>
              </div>
            );
          })}
        </div>

        {/* Overall status + denial comment */}
        <div className="mt-6">
          <p className="text-gray-700">
            <strong>Status: </strong>
            <span
              className={`inline-block px-3 py-1 rounded-lg ml-2 ${
                request.status === "DENIED"
                  ? "bg-red-100 text-red-700"
                  : request.status === "EXPIRED"
                  ? "bg-orange-100 text-orange-700"
                  : request.status === "APPROVED"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {request.status}
            </span>
          </p>
          {request.status === "DENIED" && denialComment && (
            <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-100">
              <p className="text-sm text-red-600">{denialComment}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
