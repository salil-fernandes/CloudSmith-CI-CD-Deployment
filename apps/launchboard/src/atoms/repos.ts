// @launchboard/atoms/repos.ts

import { atom } from "jotai";

interface Repo {
  id: number;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  created_at: string;
  default_branch: string;
}

export const reposAtom = atom<Repo[]>([]);
