import { Request, Response, Router } from 'express';
import { param, validationResult } from 'express-validator';
import { apiRoutes } from '../constants/index.js';
import sendError from '../utils/sendErrors.js';
import { setAllNotificationRead, setNotificationRead } from '../business/notificationService.js';

const routes: Router = Router();

const commonPath: string = apiRoutes.notification;

routes.patch(`${commonPath}/all/read`, async (req: Request, res: Response) => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	try {
		const response = await setAllNotificationRead(req);
		return res.status(200).send(response);
	} catch (err) {
		sendError(res, err);
	}
});

routes.patch(
	`${commonPath}/:notificationId/read`,
	[param('notificationId').exists()],
	async (req: Request, res: Response) => {
		if (!validationResult(req).isEmpty()) {
			return res.status(400).json({ errors: validationResult(req) });
		}

		try {
			const response = await setNotificationRead(req);
			return res.status(200).send(response);
		} catch (err) {
			sendError(res, err);
		}
	}
);

export default routes;
