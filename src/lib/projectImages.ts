import projectPulse from "@/assets/project-pulse.jpg";
import projectVault from "@/assets/project-vault.jpg";
import projectGridflow from "@/assets/project-gridflow.jpg";
import projectSpectra from "@/assets/project-spectra.jpg";
import projectLambdaforge from "@/assets/project-lambdaforge.svg";

const imageMap: Record<string, string> = {
  "project-pulse": projectPulse,
  "project-vault": projectVault,
  "project-gridflow": projectGridflow,
  "project-spectra": projectSpectra,
  "project-lambdaforge": projectLambdaforge,
};

export const getProjectImage = (key?: string): string | undefined => {
  if (!key) return undefined;
  return imageMap[key];
};
