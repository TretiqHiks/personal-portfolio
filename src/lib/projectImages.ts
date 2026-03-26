import projectLambdaforge from "@/assets/project-lambdaforge.svg";
import projectTracepack from "@/assets/project-tracepack.jpg";
import projectEstatevisio from "@/assets/project-estatevisio.jpg";
import projectCronvault from "@/assets/project-cronvault.svg";

const imageMap: Record<string, string> = {
  "project-lambdaforge": projectLambdaforge,
  "project-tracepack": projectTracepack,
  "project-estatevisio": projectEstatevisio,
  "project-cronvault": projectCronvault,
};

export const getProjectImage = (key?: string): string | undefined => {
  if (!key) return undefined;
  return imageMap[key];
};
