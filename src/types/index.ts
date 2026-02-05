export interface Param {
  id?: number;
  db_column: string;
  display_name: string;
  option_value: string[];
  field_type: string;
  value_type: string;
  api_param: boolean;
  tag_id?: number;
}

export interface Tag {
  id?: number;
  tag: string;
  query: string;
  comment: string;
  dynamic_param_source: string;
  api_active: boolean;
  api_endpoint: string;
  api_name: string;
  api_at_get_data: boolean;
  api_message: string;
  query_active: boolean;
  tag_active: boolean;
  params: Param[];
}

export interface CreateTagResponse {
  success: boolean;
  id: number;
  message: string;
}

export interface ParamFormInput {
  db_column: string;
  display_name: string;
  option_value: string;
  field_type: string;
  value_type: string;
  api_param: boolean;
}

export interface TagFormInput {
  tag: string;
  query: string;
  comment: string;
  dynamic_param_source: string;
  api_active: boolean;
  api_endpoint: string;
  api_name: string;
  api_at_get_data: boolean;
  api_message: string;
  query_active: boolean;
  tag_active: boolean;
  params: ParamFormInput[];
}
