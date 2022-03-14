// make sure to export main, with the signature
function main(el, service, imEntity, state, config, navigate) {
	if (!state) state = {};
	if (!el || !service || !imEntity || !state || !config) {
		throw new Error('Call main with correct signature');
	}

	let entity = imEntity.ChemblCompound;

	var query = {
		from: entity.class,
		select: [
			'identifier',
			'originalId',
			'inchiKey',
			'name',
			'alternateForms.identifier',
			'alternateForms.originalId',
			'alternateForms.inchiKey',
			'alternateForms.name',
			'parent.identifier',
			'parent.originalId',
			'parent.inchiKey',
			'parent.name'
		],
		joins: ['alternateForms', 'parent'],
		where: [
			{
				path: 'id',
				op: '=',
				value: entity.value
			}
		]
	};

	new imjs.Service(service).records(query).then(function(response) {
		let contents = '<h3>Alternate Forms of Compound in ChEMBL</h3>';

		let entity = response[0];
		let parent =
			'itself, <span class="naviLink" id="p' +
			entity.objectId +
			'">' +
			entity.originalId +
			'</span>';
		let naviIds = ['p' + entity.objectId];
		if (entity.parent) {
			parent =
				'<span class="naviLink" id="p' +
				entity.parent.objectId +
				'">' +
				entity.parent.originalId +
				'</span>';
			naviIds = ['p' + entity.parent.objectId];
		}
		contents += '<div>(Parent is ' + parent + ')</div>';

		contents +=
			'<div style="display: flex; flex-direction: row; flex-wrap: wrap;">';
		if (entity.alternateForms) {
			entity.alternateForms.forEach((altf, index) => {
				contents +=
					'<div id="altimage' +
					index +
					'">' +
					'<img src="https://www.ebi.ac.uk/chembl/api/data/image/' +
					altf.inchiKey +
					'?dimensions=200&format=svg" onerror="document.getElementById(\'altimage' +
					index +
					'\').innerHTML = \'Not available.\'"/><br/><span class="naviLink" id="a' +
					altf.objectId +
					'">' +
					altf.originalId +
					'</span>' +
					'<br/>' +
					altf.name +
					'</div>';
				naviIds.push('a' + altf.objectId);
			});
		}
		contents += '</div>';

		el.innerHTML = '<div class="rootContainer">' + contents + '</div>';

		naviIds.forEach(element => {
			let objectId = element.substr(1);
			document.getElementById(element).onclick = function() {
				navigate('report', { type: 'ChemblCompound', id: objectId });
			};
		});
	});
}

module.exports = { main };
