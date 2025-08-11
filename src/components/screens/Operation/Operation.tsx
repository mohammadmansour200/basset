import Convert from "@/components/ui/Operations/Convert";
import Compress from "@/components/ui/Operations/Compress";
import Quality from "@/components/ui/Operations/Quality";
import Trim from "@/components/ui/Operations/Trim";
import Cut from "@/components/ui/Operations/Cut";
import RemoveMusic from "@/components/ui/Operations/RemoveMusic";
import { OperationType, useOperationStore } from "@/stores/useOperationStore";

function Operation() {
  const { operationType } = useOperationStore();

  return (
    <div className="mt-16 flex flex-col items-center justify-center">
      {operationType === OperationType.TRIM && <Trim />}
      {operationType === OperationType.CUT && <Cut />}
      {operationType === OperationType.SPLEETER && <RemoveMusic />}
      {operationType === OperationType.COMPRESS && <Compress />}
      {operationType === OperationType.CONVERT && <Convert />}
      {operationType === OperationType.QUALITY_DOWNGRADE && <Quality />}
    </div>
  );
}

export default Operation;
