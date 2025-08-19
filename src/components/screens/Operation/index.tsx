import { OperationType, useOperationStore } from "@/stores/useOperationStore";

import Convert from "@/components/ui/Operations/Convert";
import Compress from "@/components/ui/Operations/Compress";
import Quality from "@/components/ui/Operations/Quality";
import Trim from "@/components/ui/Operations/Trim";
import Cut from "@/components/ui/Operations/Cut";
import RemoveMusic from "@/components/ui/Operations/RemoveMusic";
import MediaInfoSidebar from "./MediaInfoSidebar";

function Operation() {
  const { operationType } = useOperationStore();

  return (
    <div className="flex h-full w-full">
      <MediaInfoSidebar />
      <main className="ms-64 mt-16 flex w-full flex-col items-center">
        {operationType === OperationType.TRIM && <Trim />}
        {operationType === OperationType.CUT && <Cut />}
        {operationType === OperationType.SPLEETER && <RemoveMusic />}
        {operationType === OperationType.COMPRESS && <Compress />}
        {operationType === OperationType.CONVERT && <Convert />}
        {operationType === OperationType.QUALITY_DOWNGRADE && <Quality />}
      </main>
    </div>
  );
}

export default Operation;
