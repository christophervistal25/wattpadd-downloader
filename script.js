
const elements = {
	table  : document.querySelector('#chapters'),	
	btnFetchPage : document.querySelector('#btnFetchPage'),	
};	

const titleCellIndex = 0, statusCellIndex = 1, actionCellIndex = 2;	
let storyContents = {};	

const generateId = (string) => {	
	let id = '';	
	let characters = string.removeOverWhitespace().split('');	
	for(let i = 0; i<characters.length; i++) {	
		id += characters[i].charCodeAt();	
	}	
	return `_${id}`;	
};	


const clearTable = (table) => table.querySelectorAll('tbody tr').forEach((row) => row.remove());	

const listAllItems = (items) => {	
		items.forEach((data, index) => {	
				let newRow = elements.table.insertRow(elements.table.rows.length);	
				let title = data.textContent;	
				let id = generateId(title);	

				newRow.insertCell(titleCellIndex).appendChild(document.createTextNode(title.removeOverWhitespace()));	
				newRow.insertCell(statusCellIndex).appendChild(document.createTextNode('Downloading..'));	
				newRow.insertCell(actionCellIndex).appendChild(createButtonDownload(id, `${title.removeOverWhitespace()}`));	
				newRow.setAttribute('id', id);	
		});	
};	

const toggleDisable = (element) => element.getAttribute('disabled') ? element.removeAttribute('disabled') : element.setAttribute('disabled', true);	

const download = async (id, title, format) => {	
	if ( format == 'pdfFormat' ) {	
		let doc = new jsPDF('p', 'pt', 'letter');	
		let content = doc.splitTextToSize(await new Response(storyContents[id]).text(), 180);	
		let divElement = document.createElement('div');	
		divElement.appendChild(document.createTextNode(content));	
		document.body.appendChild(divElement);	
		specialElementHandlers = {	
                 // element with id of "bypass" - jQuery style selector	
                '#bypassme': function(element, renderer)	
                {	
                    // true = "handled elsewhere, bypass text extraction"	
                    return true	
                }	
            }	
            margins = {	
                top: 30,	
                bottom: 60,	
                left: 40,	
                width: 522	
            };	
		 doc.fromHTML	
            (	
                divElement // HTML string or DOM elem ref.	
              , margins.left // x coord	
              , margins.top // y coord	
              , {'width': margins.width // max width of content on PDF	
                 , 'elementHandlers': specialElementHandlers	
                }	
              , function (dispose) 	
                {	
                   // dispose: object with X, Y of the last line add to the PDF	
                   // this allow the insertion of new lines after html	
                   doc.save(`${title}.pdf`);	
                }	
              , margins	
            )	
	} else {	
		const doc = new Document();	
		const text =  await new Response(storyContents[id]).text();	
		const paragraph = new Paragraph(text);	
		doc.addParagraph(paragraph);	

		const packer = new Packer();	
		packer.toBlob(doc).then(blob => saveAs(blob, `${title}.docx`));	
	}	

};	

const createButtonDownload = (id, title) => {	
		let button = document.createElement('button');	
		button.appendChild(document.createTextNode('Download'));	
		button.setAttribute('id', id);	
		button.addEventListener('click', () => {	
			format = document.querySelector('input[type=radio]:checked');	
			download(id, title, format.getAttribute('id'));	
		});	
		return button;	
};	

const createButtonRetryDownload = (id,route) => {	
		let button = document.createElement('button');	
		button.appendChild(document.createTextNode('Download Again'));	
		button.setAttribute('id', id);	
		button.addEventListener('click', () => {	
			let docFragment = document.createDocumentFragment();	
			let node = document.createElement('a');	

			node.innerHTML = document.querySelector(`#${id}`).children[titleCellIndex].textContent	
			node.setAttribute('href', route);	
			docFragment.appendChild(node);	
			getEachPageInTableOfContents({	
				table_of_contents: false,	
				links : docFragment.querySelectorAll('*')	
			}); 	
		});	
		return button;	
};	

String.prototype.removeOverWhitespace = function () {	
	return this.trim().replace(/\s+/g, " ");	
};	

	// Add Re-try if execution is fail.	
	const getPageContent = async (link) => {	
		const response = await fetch(link);	
		const content  = await response.text();	
		let parser  = new DOMParser();	
		let pageContent = parser.parseFromString(content, 'text/html');	
		const isTableOfContents = (pageContent.querySelector('.story-controls') === null) ? false : true;	
		return {	
			 content : pageContent.querySelector('pre').textContent.removeOverWhitespace(),	
			 table_of_contents : isTableOfContents,	
			 links : isTableOfContents ? pageContent.querySelectorAll('.table-of-contents > li > a') : [link]	
		 };	
	};	


	const getEachPageInTableOfContents = (page) => {	
		let urls = [...page.links];	
		let successDownload = 0;	
		document.querySelector('#message').innerHTML = '';	

		for(let [index, url] of urls.entries()) {	
			let route = page.table_of_contents ? `https://www.wattpad.com${url.getAttribute('href')}` : url;	
			let rowId = generateId(urls[index].textContent);	
			let statusElement = document.querySelector(`#${rowId}`).children[statusCellIndex];	
			let actionElement = document.querySelector(`#${rowId}`).children[actionCellIndex];	
			getPageContent(route).then((story) => {	
				successDownload++;	
				statusElement.innerHTML = 'Ready';	
				statusElement.style.color = 'green';	
				actionElement.innerHTML = '';	
				actionElement.appendChild(createButtonDownload(rowId , `${urls[index].textContent.removeOverWhitespace()}`));	
				storyContents[rowId] = new Blob([story.content],{type: "text/plain"});	
			}).then(_ => successDownload === urls.length ? toggleDisable(elements.btnFetchPage) : null )	
			.catch((err) => {	
				statusElement.innerHTML = 'Failed';	
				statusElement.style.color = 'red';	
				actionElement.innerHTML = '';	
				actionElement.appendChild(createButtonRetryDownload(rowId ,'https://www.wattpad.com/470990105-dreadful-vengeance-chapter-2'));	
			});	
		}	
	};	



	document.querySelector('form').addEventListener('submit', (e) => {	
		e.preventDefault();	
		document.querySelector('#message').innerHTML = `Please wait...`;	
		toggleDisable(elements.btnFetchPage);	

		// let options = document.querySelectorAll('input[type="checkbox"]:checked');	
		const url = document.querySelector('#url').value;	

		// clear table	
		// clearTable(document.querySelector('#chapters'));	
			getPageContent(url)	
			.then((page) => {	
				listAllItems(page.links);	
				getEachPageInTableOfContents(page)	
			}).catch((err) => console.log(err));	
	});