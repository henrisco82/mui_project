import type { Tag, Param, CreateTagResponse } from '../types';

const storage: Tag[] = [];

let nextTagId = 1;
let nextParamId = 1;

const delay = (): Promise<void> => {
  const ms = Math.floor(Math.random() * 500) + 300;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const createTag = async (tagData: Omit<Tag, 'id'>): Promise<CreateTagResponse> => {
  await delay();

  const tagId = nextTagId++;

  const paramsWithIds: Param[] = tagData.params.map((param) => ({
    ...param,
    id: nextParamId++,
    tag_id: tagId,
  }));

  const newTag: Tag = {
    ...tagData,
    id: tagId,
    params: paramsWithIds,
  };

  storage.push(newTag);

  console.log('=== Mock API: Tag Created ===');
  console.log('Stored Tag:', JSON.stringify(newTag, null, 2));
  console.log('=============================');

  return {
    success: true,
    id: tagId,
    message: `Tag created successfully with ID: ${tagId}`,
  };
};

export const getTags = async (): Promise<Tag[]> => {
  await delay();
  console.log('=== Mock API: Get All Tags ===');
  console.log('Returning:', storage.length, 'tags');
  console.log('==============================');
  return [...storage];
};

export const getTagById = async (id: number): Promise<Tag | null> => {
  await delay();
  const tag = storage.find((t) => t.id === id) || null;
  console.log('=== Mock API: Get Tag By ID ===');
  console.log('ID:', id, 'Found:', !!tag);
  console.log('===============================');
  return tag ? { ...tag, params: [...tag.params] } : null;
};

export const updateTag = async (
  id: number,
  tagData: Omit<Tag, 'id'>
): Promise<CreateTagResponse> => {
  await delay();

  const index = storage.findIndex((t) => t.id === id);
  if (index === -1) {
    return {
      success: false,
      id,
      message: `Tag with ID ${id} not found`,
    };
  }

  const paramsWithIds: Param[] = tagData.params.map((param) => ({
    ...param,
    id: param.id || nextParamId++,
    tag_id: id,
  }));

  const updatedTag: Tag = {
    ...tagData,
    id,
    params: paramsWithIds,
  };

  storage[index] = updatedTag;

  console.log('=== Mock API: Tag Updated ===');
  console.log('Updated Tag:', JSON.stringify(updatedTag, null, 2));
  console.log('=============================');

  return {
    success: true,
    id,
    message: `Tag updated successfully`,
  };
};

export const deleteTag = async (id: number): Promise<CreateTagResponse> => {
  await delay();

  const index = storage.findIndex((t) => t.id === id);
  if (index === -1) {
    return {
      success: false,
      id,
      message: `Tag with ID ${id} not found`,
    };
  }

  storage.splice(index, 1);

  console.log('=== Mock API: Tag Deleted ===');
  console.log('Deleted Tag ID:', id);
  console.log('Remaining tags:', storage.length);
  console.log('=============================');

  return {
    success: true,
    id,
    message: `Tag deleted successfully`,
  };
};
