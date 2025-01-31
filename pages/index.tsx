import React, { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import RequestDetails, { RequestData } from "@/components/RequestDetails"; 
import HelpFab from "@/components/HelpFab"; 
const APP_VERSION = "v1.0.1";
// type RequestData = {
//   id: string;
//   status: string;
//   name: string;
//   department: string;
//   type: string;
//   inventoryType: string[];
//   currentApprover: string;
//   currentApproverEmail: string;
//   denialComment?: string;
//   approvals: {
//     hr?: string;
//     hod?: string;
//     it?: string;
//     admin?: string;
//   };
// };

const RequestTracker = () => {
  const [requestId, setRequestId] = useState("");
  const [request, setRequest] = useState<RequestData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // const isValidRequestId = (id: string) => /^IRF-[0-9A-Z]{5}$/.test(id);
console.log(process.env.API_KEY)
console.log(process.env.FORM_ID)
console.log(process.env.BASE_URL)
  const handleSearch = async () => {
    // if (!isValidRequestId(requestId)) {
    //   setError("Invalid request ID format. Format should be IRF-XXXXX");
    //   return;
    // }

    setLoading(true);
    setError("");
    setRequest(null);

    try {
      const response = await fetch(`/api/getRequest?requestId=${requestId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unknown error occurred");
      }
      setRequest(data);
    } catch (err) {
      console.error("❌ Error:", err);

      // Check if err is an instance of Error
      if (err instanceof Error) {
          setError(err.message);
      } else {
          setError("An unknown error occurred.");
      }
  } finally {
      setLoading(false);
  }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
       <div className="absolute top-4 right-4 text-gray-500 text-sm font-medium">
        {APP_VERSION}
      </div>
      <div className="max-w-3xl w-full bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          📋 New External Invigilator and Center Payment request flow
        </h1>

        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            placeholder="Enter Request ID (e.g., IRF-1X2YZ)"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-2 outline-none border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{loading ? "Searching..." : "Search"}</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            ❌ {error}
          </div>
        )}

        {request && <RequestDetails request={request} />}
        <HelpFab />
      </div>
    </div>
  );
};

export default RequestTracker;