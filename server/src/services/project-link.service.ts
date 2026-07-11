import { db } from "../database";
import { ProjectLinkRepository } from "../repositories/projectLink.repository";
import { NotFoundError, conflictError } from "../shared/errors";
import { CreateProjectLinkSchema } from "../schemas/projectLink.schema";

const projectLinkRepository = new ProjectLinkRepository();

export class ProjectLinkService {
  async getAllLinksByProject(project_id: number) {
    return await projectLinkRepository.getLinksByProject(project_id);
  }
  async addLinkToProject(
    input: CreateProjectLinkSchema,
    project_id: number,
    user_id: number,
  ) {
    const existing = await projectLinkRepository.getLinkByLabel(
      input.label,
      project_id,
    );
    if (existing) {
      throw new conflictError("This workapp already exists");
    }
    const projectLink = await projectLinkRepository.create(
      project_id,
      {
        label: input.label,
        url: input.url,
      },
      user_id,
    );
    return projectLink;
  }

  async updateLink(
    id: number,
    input: CreateProjectLinkSchema,
    project_id: number,
  ) {
    const existingLink = await projectLinkRepository.getLinkById(
      id,
      project_id,
    );
    if (!existingLink) {
      throw new NotFoundError("WorkApp");
    }
    return await projectLinkRepository.update(
      id,
      { label: input.label, url: input.url },
      project_id,
    );
  }
  async deleteLink(id: number, project_id: number) {
    const existingLink = await projectLinkRepository.getLinkById(
      id,
      project_id,
    );
    if (!existingLink) {
      throw new NotFoundError("WorkApp");
    }
    return await projectLinkRepository.deleteLink(id, project_id);
  }
}
