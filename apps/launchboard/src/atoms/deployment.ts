// atoms/deployment.ts
import { atom } from "jotai";

export const lastDeployedRepoAtom = atom<string | null>(null);
