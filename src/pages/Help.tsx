
import { GraduationCap } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const Help = () => {
  return (
    <AppLayout title="Help & Support">
      <div className="max-w-6xl mx-auto p-4">
        <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Academic Records</h3>
          </div>
          <ul className="mt-2 space-y-2 text-sm list-disc list-inside">
            <li>Add exam scores and grades</li>
            <li>Track progress by subject</li>
            <li>Monitor term-by-term improvement</li>
            <li>Compare performance across subjects</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default Help;
