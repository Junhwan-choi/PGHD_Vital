export type CustomResponse = {
    success: boolean;
    code: string;
    data?: {
        accessToken?: string;
    };
    message: string;
    token?: any;
};
export type FileDownloadResponse = {
    success: boolean;
    message: string;
    file: Blob; 
};
  export type JwtToken = {
    id: string;  
    name: string;  
    title: string;  
    organization: string;  
    auth: string;  
    exp: number;
  };
  
  export type CbSignUpType = {
      userId: string;
      name: string;
      organization: string;  
      accountAddr: string;
      accountPwd: string;	
  }
  
  export type CbTagCreateType = {
      conditions: string;
  }
  export type PreprocessType = {
    manufacturers: string[];
    files: File[];
  };
  

  export type LoginType = {
    loginId: string;  
    password: string;
  };
  export type SignupType = {  email: string;  password: string; name: string; }

  
  