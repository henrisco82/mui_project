import axios from 'axios';
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { createTag, getTags, getTagById, updateTag, deleteTag } from './mockApi';
import type { Tag } from '../types';

const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  const url = config.url || '';
  const method = config.method || 'get';

  console.log(`Mock API Request: ${method.toUpperCase()} ${url}`);

  // GET /tags - List all tags
  if (url === '/tags' && method === 'get') {
    const result = await getTags();
    return {
      data: result,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // GET /tags/:id - Get single tag
  const getMatch = url.match(/^\/tags\/(\d+)$/);
  if (getMatch && method === 'get') {
    const id = parseInt(getMatch[1], 10);
    const result = await getTagById(id);
    if (result) {
      return {
        data: result,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }
    throw { response: { status: 404, data: { message: 'Tag not found' } } };
  }

  // POST /tags - Create tag
  if (url === '/tags' && method === 'post') {
    const tagData: Omit<Tag, 'id'> = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    const result = await createTag(tagData);
    return {
      data: result,
      status: 201,
      statusText: 'Created',
      headers: {},
      config,
    };
  }

  // PUT /tags/:id - Update tag
  const putMatch = url.match(/^\/tags\/(\d+)$/);
  if (putMatch && method === 'put') {
    const id = parseInt(putMatch[1], 10);
    const tagData: Omit<Tag, 'id'> = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    const result = await updateTag(id, tagData);
    return {
      data: result,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // DELETE /tags/:id - Delete tag
  const deleteMatch = url.match(/^\/tags\/(\d+)$/);
  if (deleteMatch && method === 'delete') {
    const id = parseInt(deleteMatch[1], 10);
    const result = await deleteTag(id);
    return {
      data: result,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  throw new Error(`No mock handler for ${method.toUpperCase()} ${url}`);
};

const axiosClient = axios.create({
  baseURL: '/api',
  adapter: mockAdapter,
});

export default axiosClient;
