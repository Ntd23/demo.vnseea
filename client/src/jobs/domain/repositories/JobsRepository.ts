// English description: Defines the repository contract for job catalog loading and real backend apply, create, and delete mutations.

import type {
  JobApplicationDraft,
  JobApplicantRecord,
  JobCatalogQuery,
  JobCreateDraft,
  JobDetailRecord,
  JobMutationResult,
  JobsCatalogRecord,
} from "../types/jobs.types"

export interface JobsRepository {
  getCatalog(input?: JobCatalogQuery): Promise<JobsCatalogRecord>
  getDetailByPostId(postId: number): Promise<JobDetailRecord | null>
  getApplicantsByPostId(postId: number): Promise<JobApplicantRecord[]>
  applyToJob(input: JobApplicationDraft): Promise<JobMutationResult>
  createJob(input: JobCreateDraft): Promise<JobMutationResult>
  deleteJob(jobId: number): Promise<JobMutationResult>
}
