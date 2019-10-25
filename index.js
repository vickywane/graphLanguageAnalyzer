  function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }

        function cleanInput(text){ //--- Cleanse Input Data
            text = text.replace(/[&\/\\#,+()$~%.'":|!@;*?<>{}\-\.]/g, '').toLowerCase();
            text = text.replace(/\ {2,}/g, " ");
            text = text.replace(/\n/g, " ");
            return text;
        }

        function generateGraph(cy, text){
            var data = text.split(" ");
            data.forEach(function (word, index, arr) {
                if (word === "" || word == " ")
                    arr.splice(index, 1);
            });

            data = data.filter(onlyUnique);

            data.forEach(function (word, index, arr) {
                arr[index] = word.split('')
            });

            //console.log(data);

            //--- Generate Graph

            cy.elements().remove();

            var previous = {
                letter: '$',
                l_index: '$',
                index: '$',
                check: false
            };
            var check = false;
            var firstLetter = true;
            var filtering_saves = new Array();

            cy.add({
                group: 'nodes',
                data: {
                    id: "start",
                    tag: "start"
                }
            })

            data.forEach(function (word, index, arr) {
                previousRepeat = true;
                filtering_saves = new Array();

                word.forEach(function (letter, l_index, letters) {
                    if(l_index > 0)
                        var filtered = cy.$('node[tag = "' + letter + '"][l_index = ' + l_index + '][start = "' + letters[0] + '"][left = "' + letters[l_index-1] + '"]')
                    else 
                        var filtered = cy.$('node[tag = "' + letter + '"][l_index = ' + l_index + '][start = "' + letters[0] + '"]')

                    var filtering_saves_new = new Array();
                    var end = new Boolean;
                    //console.log("How long: " + letters.length + " " + l_index);
                    l_index == letters.length - 1 ? end = 1 : end = 0;
                    //console.log("END:" + end)
                    
                    //Checking if searched node exist and adding nodes to searched
                    if (filtered[0] != undefined && l_index != 0 && previousRepeat) {

                        filtered.forEach(function (element, i, collected) {
                            filtering_saves_new.push(element);
                            //console.log(element.data('id') + " " + element.data('index'));
                        });

                        // var same = new Array();
                        // for (var i = 0; i < filtering_saves.length; i++) {
                        //     var item1 = filtering_saves[i],
                        //         found = false;
                        //     for (var j = 0; j < filtering_saves_new.length && ! found; j++) {
                        //         found = (item1.data('index') === filtering_saves_new[j].data('index') && item1.data('tag') === filtering_saves_new[j].data('left'));
                        //     }   
                        //     if (found === true) { // isUnion is coerced to boolean
                        //         same.push(item1);
                        //     }
                        // }

                        //filtering_saves = same;
                        // console.log("Same");
                        // console.log(same);
                        //console.log("Data:" ,filtering_saves_new, filtering_saves)

                        //Edge value incrementation
                        var inc_edge = cy.edges('[id = "'+ 
                        filtering_saves[0].data('tag') +
                        "_" + letter +
                        "_" + filtering_saves_new[0].data('index') +
                        "_" + l_index +
                        '"]');

                        if(inc_edge[0] != undefined) {
                            var data_value = inc_edge[0].data('tag');
                            inc_edge[0].data('tag', data_value+1);
                            
                        }
                        //console.log(inc_edge);

                        filtering_saves = filtering_saves_new;

                    } else if (filtered[0] != undefined && l_index == 0 && previousRepeat) {
                        filtered.forEach(function (element, i, collected) {
                            filtering_saves_new.push(element);
                        });
                        filtering_saves = filtering_saves_new;
                        
                        
                        //Edge value incrementation
                        var inc_edge = cy.edges('[id = "'+ letter +'_start"]');
                        var data_value = inc_edge[0].data('tag');
                        inc_edge[0].data('tag', data_value+1);
                        
                        //console.log(inc_edge);

                    } else {
                        filtering_saves = [];
                        previousRepeat = false;
                    }


                    if (check = filtered.length != cy.collection().length &&
                        previousRepeat == true) {

                        previous.letter = filtering_saves[0].data('tag')
                        previous.l_index = filtering_saves[0].data('l_index')
                        previous.index = filtering_saves[0].data('index')
                        previous.check = check
                        //console.log("Previous", previous)

                        if (end == 1) filtering_saves[0].data('end', 1);

                    } else {
                        previousRepeat = false;
                        cy.add({
                            group: 'nodes',
                            data: {
                                id: letter + '_' + index + '_' + l_index,
                                tag: letter,
                                l_index: l_index,
                                index: index,
                                left: previous.letter,
                                right: letter,
                                start: letters[0],
                                end: end,
                                search: 0
                            }
                        });
                        if (l_index > 0) {
                            
                            //console.log("Edge: ", previous, { letter, l_index, index, check })
                            
                            cy.add({
                                group: 'edges',
                                data: {
                                    id: previous.letter + '_' + letter +
                                        '_' + index + '_' + l_index,
                                    left: previous.letter,
                                    right: letter,
                                    tag: 1,
                                    source: previous.letter + '_' +
                                        previous.index +
                                        '_' + previous.l_index,
                                    target: letter + '_' + index + '_' +
                                        l_index,
                                    search: 0
                                }
                            });
                            
                        } else if (l_index == 0) {

                            cy.add({
                                group: 'edges',
                                data: {
                                    id: letter + "_start",
                                    left: "start",
                                    right: letter,
                                    tag: 1,
                                    source: "start",
                                    target: letter + '_' + index + '_' +
                                        l_index,
                                    search: 0
                                }
                            });
                        }

                        previous = { letter, l_index, index, check };
                    
                    }
                });
            });

            cy.layout({
                //name: 'cose'
                name: 'cose-bilkent'
                //name: 'grid'
                //name: 'breadthfirst', avoidOverlap: true,
                //name: 'concentric'
                //name: 'random'
            }).run();

        }

        function searchSubGraphSylabs(cy, text){
            if(text.length > 0)
                var serached = cy.nodes('[tag = "' + text[0] + '"]');
                //console.log(serached);
                serached.forEach( function(ele, i, eles){
                    second = ele.neighborhood('[tag = "' + text[1] + '"][left = "' + text[0] + '"][l_index = ' + (ele.data('l_index') + 1 )+ ']');
                    //console.log(second);
                    if(second.length > 0){
                        second.forEach( function(ele1, i1, eles1){
                            
                            console.log(ele, ele1);

                            //Changing first and second element
                            ele.data('search', 1);
                            ele1.data('search', 1);

                            search_edge = ele.edgesWith(ele1);
                            search_edge.data('search', 1);

                            //console.log(search_edge);
                        });
                    }
                });
        }

        $(function () {
            var cy = cytoscape({
                container: document.getElementById('cy'),
                wheelSensitivity: 1,
                style: [{
                    selector: 'node',
                    style: {
                        shape: 'ellipse',
                        'background-color': 'grey',
                        label: 'data(tag)'
                    }
                }, {
                    selector: 'edge',
                    style: {
                        'label': 'data(tag)', // maps to data.label
                        'line-color': 'aqua',
                        'width': 2,
                        'curve-style': 'bezier',
                        'target-arrow-shape': 'vee',
                        'target-arrow-color': 'aqua'
                    }
                }, {
                    selector: "node[l_index = 0]",
                    style: {
                        shape: 'hexagon',
                        'background-color': 'red',
                        label: 'data(tag)'
                    }
                }, {
                    selector: "node[end = 1]",
                    style: {
                        shape: 'tag',
                        'background-color': 'blue',
                        label: 'data(tag)'
                    }
                }, {
                    selector: 'node[id = "start"]',
                    style: {
                        shape: 'star',
                        'background-color': 'green',
                        label: 'data(tag)'
                    }
                }, {
                    selector: 'node[search = 1]',
                    style: {
                        'background-color': 'black',
                    }
                }, {
                    selector: 'edge[search = 1]',
                    style: {
                        'line-color': 'purple',
                        'target-arrow-color': 'purple'
                    }
                }]
            });

            //cy.layout({name: 'cose'}).run();

            $("form").submit(function (e) {
                e.preventDefault();
            });

            $("#analyzeIt").on("click", function () {
                var text = $("#toAnalyze").val();
                
                //--- Cleaning Data
                text = cleanInput(text);
                generateGraph(cy, text);

                //comment this - it's auto search for "sd"
                //var searchFor = "sd";
                //searchSubGraphSylabs(cy, searchFor);
            });

            $("#analyzeCrap").on("click", function () {
                var text = $("#toAnalyze").val();
                
                //--- Cleaning Data
                generateGraph(cy, text);
            });

            $("#analyzeEnteredSylabs").on("click", function () {
                var text = $("#analyzeSylabsTextbox").val();
                
                //----------------------------------------START Refreshing to fecator
                var ref = $("#toAnalyze").val();
                //--- Cleaning Data
                ref = cleanInput(ref);
                generateGraph(cy, ref);
                //----------------------------------------END Refreshing to fecator

                //--- Cleaning Data
                searchFor = cleanInput(text);
                searchSubGraphSylabs(cy, searchFor);
            });

            $("#analyzeEnteredSylabsSpecial").on("click", function () {
                var text = $("#analyzeSylabsTextbox").val();
                
                //----------------------------------------START Refreshing to fecator
                var ref = $("#toAnalyze").val();
                generateGraph(cy, ref);
                //----------------------------------------END Refreshing to fecator

                //--- Cleaning Data
                searchFor = cleanInput(text);
                searchSubGraphSylabs(cy, searchFor);
            });

            cy.on('tap', function(event){
                // target holds a reference to the originator
                // of the event (core or element)
                var evtTarget = event.target;
                console.log("Clicked:", evtTarget);
                
            });

        });