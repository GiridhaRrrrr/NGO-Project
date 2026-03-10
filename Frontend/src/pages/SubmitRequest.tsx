import { RequestForm } from "@/components/RequestForm";
import { useNavigate } from "react-router-dom";

export default function SubmitRequest() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-2xl py-8">
      <RequestForm onSuccess={() => {}} />
    </div>
  );
}
