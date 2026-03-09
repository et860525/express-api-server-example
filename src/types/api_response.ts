// ******************************************
// *            API Response
// ******************************************

export type ApiResponse<T = any> = {
  success: boolean;
  status?: number;
  message?: string;
  data?: T;
};
