import { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/sendErrors.js';
import {
	createNewBuild,
	listBuilds,
	removeBuild,
	updateBuild,
	listClanSharedBuilds,
	copySharedBuild
} from '../business/dinozBuildService.js';
import {
	CopyDinozBuildResponse,
	CreateDinozBuildResponse,
	DeleteDinozBuildResponse,
	GetOwnDinozBuildResponse,
	ListClanSharedBuildsResponse,
	UpdateDinozBuildResponse
} from '@drpg/core/returnTypes/DinozBuild';
import { ErrorResponse } from './index.js';

const routes: Router = Router();
const commonPath = apiRoutes.dinozBuildRoutes;

routes.get(`${commonPath}`, [], async (req: Request, res: Response<GetOwnDinozBuildResponse>) => {
	try {
		return res.status(200).send(await listBuilds(req));
	} catch (err) {
		sendError(res, err);
	}
});

routes.post(
	`${commonPath}`,
	[body('skills').exists().isArray(), body('name').exists().isString(), body('shareable').exists().isBoolean()],
	async (req: Request, res: Response<CreateDinozBuildResponse | ErrorResponse>) => {
		if (!validationResult(req).isEmpty()) return res.status(400).json({ errors: validationResult(req) });
		try {
			return res.status(201).send(await createNewBuild(req));
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.put(
	`${commonPath}/:buildId`,
	[
		param('buildId').exists().isString(),
		body('skills').exists().isArray(),
		body('name').exists().isString(),
		body('shareable').exists().isBoolean()
	],
	async (req: Request, res: Response<UpdateDinozBuildResponse | ErrorResponse>) => {
		if (!validationResult(req).isEmpty()) return res.status(400).json({ errors: validationResult(req) });
		try {
			await updateBuild(req);
			return res.status(200).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.delete(
	`${commonPath}/:buildId`,
	[param('buildId').exists().isString()],
	async (req: Request, res: Response<DeleteDinozBuildResponse | ErrorResponse>) => {
		if (!validationResult(req).isEmpty()) return res.status(400).json({ errors: validationResult(req) });
		try {
			await removeBuild(req);
			return res.status(204).send();
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.get(
	`${commonPath}/shared/clan`,
	[],
	async (req: Request, res: Response<ListClanSharedBuildsResponse | ErrorResponse>) => {
		try {
			return res.status(200).send(await listClanSharedBuilds(req));
		} catch (err) {
			sendError(res, err);
		}
	}
);

routes.post(
	`${commonPath}/:buildId/copy`,
	[param('buildId').exists().isString()],
	async (req: Request, res: Response<CopyDinozBuildResponse | ErrorResponse>) => {
		if (!validationResult(req).isEmpty()) return res.status(400).json({ errors: validationResult(req) });
		try {
			return res.status(201).send(await copySharedBuild(req));
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
