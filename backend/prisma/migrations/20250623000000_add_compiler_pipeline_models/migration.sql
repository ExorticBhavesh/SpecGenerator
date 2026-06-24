-- AlterEnum
ALTER TYPE "StageName" ADD VALUE 'CONSISTENCY';
ALTER TYPE "StageName" ADD VALUE 'REPAIR';
ALTER TYPE "StageName" ADD VALUE 'SIMULATION';

-- AlterTable
ALTER TABLE "pipeline_stage_results" ADD COLUMN "durationMs" INTEGER;

-- CreateTable
CREATE TABLE "pipeline_executions" (
    "id" TEXT NOT NULL,
    "pipelineRunId" TEXT NOT NULL,
    "totalDurationMs" INTEGER,
    "status" "PipelineStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pipeline_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_logs" (
    "id" TEXT NOT NULL,
    "pipelineRunId" TEXT,
    "repaired" BOOLEAN NOT NULL,
    "repairs" JSONB NOT NULL,
    "finalSchema" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repair_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consistency_logs" (
    "id" TEXT NOT NULL,
    "pipelineRunId" TEXT,
    "passed" BOOLEAN NOT NULL,
    "errors" JSONB NOT NULL,
    "warnings" JSONB NOT NULL,
    "summary" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consistency_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_runs" (
    "id" TEXT NOT NULL,
    "status" "PipelineStatus" NOT NULL DEFAULT 'PENDING',
    "runs" JSONB NOT NULL DEFAULT '[]',
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageLatency" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "repairRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "repairCount" INTEGER NOT NULL DEFAULT 0,
    "failureTypes" JSONB NOT NULL DEFAULT '[]',
    "consistencyErrors" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pipeline_executions_pipelineRunId_key" ON "pipeline_executions"("pipelineRunId");

-- AddForeignKey
ALTER TABLE "pipeline_executions" ADD CONSTRAINT "pipeline_executions_pipelineRunId_fkey" FOREIGN KEY ("pipelineRunId") REFERENCES "pipeline_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_logs" ADD CONSTRAINT "repair_logs_pipelineRunId_fkey" FOREIGN KEY ("pipelineRunId") REFERENCES "pipeline_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consistency_logs" ADD CONSTRAINT "consistency_logs_pipelineRunId_fkey" FOREIGN KEY ("pipelineRunId") REFERENCES "pipeline_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
