import { IDreamNode } from "@domain/models/dream-node.model";

export interface IPublicDreamOwner {
  id: string;
  username: string;
  avatar_url?: string;
}

export interface IPublicDream extends IDreamNode {
  owner: IPublicDreamOwner;
}
