/**
 * Type definitions for government contract opportunities
 */

export interface Opportunity {
  noticeId?: string;
  title?: string;
  solicitationNumber?: string;
  fullParentPathName?: string;
  postedDate?: string;
  type?: string;
  baseType?: string;
  archiveType?: string;
  archiveDate?: string;
  typeOfSetAsideDescription?: string;
  typeOfSetAside?: string;
  responseDeadLine?: string;
  naicsCode?: string;
  classificationCode?: string;
  active?: string;
  award?: {
    date?: string;
    number?: string;
    amount?: string;
  };
  pointOfContact?: Array<{
    type?: string;
    title?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    fax?: string;
  }>;
  description?: string;
  organizationId?: string;
  officeAddress?: {
    zipcode?: string;
    city?: string;
    countryCode?: string;
    state?: string;
  };
  placeOfPerformance?: {
    city?: {
      code?: string;
      name?: string;
    };
    state?: {
      code?: string;
      name?: string;
    };
    country?: {
      code?: string;
      name?: string;
    };
    zip?: string;
  };
  additionalInfoLink?: string;
  uiLink?: string;
  links?: Array<{
    rel?: string;
    href?: string;
  }>;
  resourceLinks?: string[];
}

export interface SamSearchResponse {
  opportunitiesData?: Opportunity[];
  totalRecords?: number;
}

export interface SamSearchParams {
  query: string;
  naics?: string;
  limit?: number;
  postedFrom?: string;
  postedTo?: string;
}
