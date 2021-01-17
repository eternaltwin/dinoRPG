import DinozController from '../../app/controllers/dinoz.controller.js';
import DinozRepository from '../../app/repositories/dinoz.repository.js';
import { getBasicDinoz, completeDinoz } from '../data/dinozData.js';
import { getBasicPlayer } from '../data/playerData.js';

describe('Test du fichier dinozController.js', function() {

    beforeEach(function() {
        spyOn(DinozRepository, 'getPlayerFromDinozId').and.returnValue(getBasicPlayer);
        spyOn(DinozRepository, 'getDinozFiche').and.returnValue(completeDinoz);
    });

    it('Récupération des détails d\'un dinoz - Cas nominal', async function() {

        const response = await DinozController.getDinozFiche(getBasicDinoz, '');

        console.log(response);
        expect(response).not.toBeNull();
    });

});