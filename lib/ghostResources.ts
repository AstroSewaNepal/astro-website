import GhostContentAPI from '@tryghost/content-api';
import { ghostClient } from './ghostClient';

const resources = {
  posts: ghostClient.posts,
  pages: ghostClient.pages,
  authors: ghostClient.authors,
  tags: ghostClient.tags,
} as const;

export type GhostResource = keyof typeof resources;

export const isGhostResource = (value: string): value is GhostResource =>
  Object.prototype.hasOwnProperty.call(resources, value);

export const getGhostResource = <Key extends GhostResource>(key: Key) => resources[key];

type GhostClientInstance = InstanceType<typeof GhostContentAPI>;

export type BrowseMethod = GhostClientInstance['posts']['browse'];
export type ReadMethod = GhostClientInstance['posts']['read'];
