import React from 'react';
import { Mail, Phone, MessageSquare } from 'lucide-react';

// Define the type for the approver object
interface Approver {
    role: string;
    name: string;
    email: string;
    phone: string;
}

interface ApproverCardProps {
    approver: Approver;
    requestId: string | number;
}

const ApproverCard: React.FC<ApproverCardProps> = ({ approver, requestId }) => {
    const getGoogleChatUrl = (email: string) => {
        const message = `Hi, I wanted to check about the inventory request ${requestId}`;
        return `https://mail.google.com/chat/u/0/#chat/dm/${email}?message=${encodeURIComponent(message)}`;
    };

    return (
        <div className="approver-card">
            <h3>{approver.role} - {approver.name}</h3>
            <p><Mail /> {approver.email}</p>
            <p><Phone /> {approver.phone}</p>
            <a href={getGoogleChatUrl(approver.email)} target="_blank" rel="noopener noreferrer">
                <MessageSquare /> Chat
            </a>
        </div>
    );
};

export default ApproverCard;
