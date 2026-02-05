import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import type { Tag, CreateTagResponse } from '../types';

const TAGS_QUERY_KEY = ['tags'];

// Fetch all tags
const fetchTags = async (): Promise<Tag[]> => {
  const response = await axiosClient.get<Tag[]>('/tags');
  return response.data;
};

export const useTags = () => {
  return useQuery({
    queryKey: TAGS_QUERY_KEY,
    queryFn: fetchTags,
  });
};

// Fetch single tag
const fetchTagById = async (id: number): Promise<Tag> => {
  const response = await axiosClient.get<Tag>(`/tags/${id}`);
  return response.data;
};

export const useTag = (id: number | null) => {
  return useQuery({
    queryKey: [...TAGS_QUERY_KEY, id],
    queryFn: () => fetchTagById(id!),
    enabled: id !== null,
  });
};

// Create tag
const createTagRequest = async (tag: Omit<Tag, 'id'>): Promise<CreateTagResponse> => {
  const response = await axiosClient.post<CreateTagResponse>('/tags', tag);
  return response.data;
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTagRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    },
  });
};

// Update tag
const updateTagRequest = async ({
  id,
  data,
}: {
  id: number;
  data: Omit<Tag, 'id'>;
}): Promise<CreateTagResponse> => {
  const response = await axiosClient.put<CreateTagResponse>(`/tags/${id}`, data);
  return response.data;
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTagRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    },
  });
};

// Delete tag
const deleteTagRequest = async (id: number): Promise<CreateTagResponse> => {
  const response = await axiosClient.delete<CreateTagResponse>(`/tags/${id}`);
  return response.data;
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTagRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    },
  });
};
