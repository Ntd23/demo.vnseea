// English description: Keeps jobs API bridge paths local to the jobs bounded context to preserve strict route ownership boundaries.

export const jobsApiRoutes = {
  catalog: "/_api/jobs",
  detailByJobId: (jobId: number) => `/_api/jobs/${jobId}`,
  detailByPostId: (postId: number) => `/_api/jobs/by-post/${postId}`,
  applicantsByPostId: (postId: number) => `/_api/jobs/by-post/${postId}/applicants`,
  create: "/_api/jobs/create",
  apply: "/_api/jobs/apply",
  delete: (jobId: number) => `/_api/jobs/${jobId}`,
} as const
