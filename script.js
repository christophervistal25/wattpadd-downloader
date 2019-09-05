function _slicedToArray(arr, i) {
  return (
    _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest()
  );
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;
  try {
    for (
      var _i = arr[Symbol.iterator](), _s;
      !(_n = (_s = _i.next()).done);
      _n = true
    ) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread()
  );
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _iterableToArray(iter) {
  if (
    Symbol.iterator in Object(iter) ||
    Object.prototype.toString.call(iter) === "[object Arguments]"
  )
    return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function() {
    var self = this,
      args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}

var elements = {
  table: document.querySelector("#chapters"),
  btnFetchPage: document.querySelector("#btnFetchPage")
};
var titleCellIndex = 0,
  statusCellIndex = 1,
  actionCellIndex = 2;
var storyContents = {};

var generateId = function generateId(string) {
  var id = "";
  var characters = string.removeOverWhitespace().split("");

  for (var i = 0; i < characters.length; i++) {
    id += characters[i].charCodeAt();
  }

  return "_".concat(id);
};

var clearTable = function clearTable(table) {
  return table.querySelectorAll("tbody tr").forEach(function(row) {
    return row.remove();
  });
};

var listAllItems = function listAllItems(items) {
  items.forEach(function(data, index) {
    var newRow = elements.table.insertRow(elements.table.rows.length);
    var title = data.textContent;
    var id = generateId(title);
    newRow
      .insertCell(titleCellIndex)
      .appendChild(document.createTextNode(title.removeOverWhitespace()));
    newRow
      .insertCell(statusCellIndex)
      .appendChild(document.createTextNode("Downloading.."));
    newRow
      .insertCell(actionCellIndex)
      .appendChild(
        createButtonDownload(id, "".concat(title.removeOverWhitespace()))
      );
    newRow.setAttribute("id", id);
  });
};

var toggleDisable = function toggleDisable(element) {
  return element.getAttribute("disabled")
    ? element.removeAttribute("disabled")
    : element.setAttribute("disabled", true);
};

var download =
  /*#__PURE__*/
  (function() {
    var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(id, title, format) {
        var doc, content, divElement, _doc, text, paragraph, packer;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch ((_context.prev = _context.next)) {
              case 0:
                if (!(format == "pdfFormat")) {
                  _context.next = 15;
                  break;
                }

                doc = new jsPDF("p", "pt", "letter");
                _context.t0 = doc;
                _context.next = 5;
                return new Response(storyContents[id]).text();

              case 5:
                _context.t1 = _context.sent;
                content = _context.t0.splitTextToSize.call(
                  _context.t0,
                  _context.t1,
                  180
                );
                divElement = document.createElement("div");
                divElement.appendChild(document.createTextNode(content));
                document.body.appendChild(divElement);
                specialElementHandlers = {
                  // element with id of "bypass" - jQuery style selector
                  "#bypassme": function bypassme(element, renderer) {
                    // true = "handled elsewhere, bypass text extraction"
                    return true;
                  }
                };
                margins = {
                  top: 30,
                  bottom: 60,
                  left: 40,
                  width: 522
                };
                doc.fromHTML(
                  divElement, // HTML string or DOM elem ref.
                  margins.left, // x coord
                  margins.top, // y coord
                  {
                    width: margins.width, // max width of content on PDF
                    elementHandlers: specialElementHandlers
                  },
                  function(dispose) {
                    // dispose: object with X, Y of the last line add to the PDF
                    // this allow the insertion of new lines after html
                    doc.save("".concat(title, ".pdf"));
                  },
                  margins
                );
                _context.next = 23;
                break;

              case 15:
                _doc = new Document();
                _context.next = 18;
                return new Response(storyContents[id]).text();

              case 18:
                text = _context.sent;
                paragraph = new Paragraph(text);

                _doc.addParagraph(paragraph);

                packer = new Packer();
                packer.toBlob(_doc).then(function(blob) {
                  return saveAs(blob, "".concat(title, ".docx"));
                });

              case 23:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      })
    );

    return function download(_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  })();

var createButtonDownload = function createButtonDownload(id, title) {
  var button = document.createElement("button");
  button.appendChild(document.createTextNode("Download"));
  button.setAttribute("id", id);
  button.addEventListener("click", function() {
    format = document.querySelector("input[type=radio]:checked");
    download(id, title, format.getAttribute("id"));
  });
  return button;
};

var createButtonRetryDownload = function createButtonRetryDownload(id, route) {
  var button = document.createElement("button");
  button.appendChild(document.createTextNode("Download Again"));
  button.setAttribute("id", id);
  button.addEventListener("click", function() {
    var docFragment = document.createDocumentFragment();
    var node = document.createElement("a");
    node.innerHTML = document.querySelector("#".concat(id)).children[
      titleCellIndex
    ].textContent;
    node.setAttribute("href", route);
    docFragment.appendChild(node);
    getEachPageInTableOfContents({
      table_of_contents: false,
      links: docFragment.querySelectorAll("*")
    });
  });
  return button;
};

String.prototype.removeOverWhitespace = function() {
  return this.trim().replace(/\s+/g, " ");
}; // Add Re-try if execution is fail.

var getPageContent =
  /*#__PURE__*/
  (function() {
    var _ref2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(link) {
        var response, content, parser, pageContent, isTableOfContents;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch ((_context2.prev = _context2.next)) {
              case 0:
                _context2.next = 2;
                return fetch(link);

              case 2:
                response = _context2.sent;
                _context2.next = 5;
                return response.text();

              case 5:
                content = _context2.sent;
                parser = new DOMParser();
                pageContent = parser.parseFromString(content, "text/html");
                isTableOfContents =
                  pageContent.querySelector(".story-controls") === null
                    ? false
                    : true;
                return _context2.abrupt("return", {
                  content: pageContent
                    .querySelector("pre")
                    .textContent.removeOverWhitespace(),
                  table_of_contents: isTableOfContents,
                  links: isTableOfContents
                    ? pageContent.querySelectorAll(
                        ".table-of-contents > li > a"
                      )
                    : [link]
                });

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      })
    );

    return function getPageContent(_x4) {
      return _ref2.apply(this, arguments);
    };
  })();

var getEachPageInTableOfContents = function getEachPageInTableOfContents(page) {
  var urls = _toConsumableArray(page.links);

  var successDownload = 0;
  document.querySelector("#message").innerHTML = "";
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var _step$value = _slicedToArray(_step.value, 2),
        index = _step$value[0],
        url = _step$value[1];

      var route = page.table_of_contents
        ? "https://www.wattpad.com".concat(url.getAttribute("href"))
        : url;
      var rowId = generateId(urls[index].textContent);
      var statusElement = document.querySelector("#".concat(rowId)).children[
        statusCellIndex
      ];
      var actionElement = document.querySelector("#".concat(rowId)).children[
        actionCellIndex
      ];
      getPageContent(route)
        .then(function(story) {
          successDownload++;
          statusElement.innerHTML = "Ready";
          statusElement.style.color = "green";
          actionElement.innerHTML = "";
          actionElement.appendChild(
            createButtonDownload(
              rowId,
              "".concat(urls[index].textContent.removeOverWhitespace())
            )
          );
          storyContents[rowId] = new Blob([story.content], {
            type: "text/plain"
          });
        })
        .then(function(_) {
          return successDownload === urls.length
            ? toggleDisable(elements.btnFetchPage)
            : null;
        })
        .catch(function(err) {
          statusElement.innerHTML = "Failed";
          statusElement.style.color = "red";
          actionElement.innerHTML = "";
          actionElement.appendChild(
            createButtonRetryDownload(
              rowId,
              "https://www.wattpad.com/470990105-dreadful-vengeance-chapter-2"
            )
          );
        });
    };

    for (
      var _iterator = urls.entries()[Symbol.iterator](), _step;
      !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
      _iteratorNormalCompletion = true
    ) {
      _loop();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};

document.querySelector("form").addEventListener("submit", function(e) {
  e.preventDefault();
  document.querySelector("#message").innerHTML = "Please wait...";
  toggleDisable(elements.btnFetchPage);
  var url = document.querySelector("#url").value; // clear table

  clearTable(document.querySelector("#chapters"));
  getPageContent(url)
    .then(function(page) {
      listAllItems(page.links);
      getEachPageInTableOfContents(page);
    })
    .catch(function(err) {
      return console.log(err);
    });
});
