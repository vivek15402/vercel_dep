

$(document).ready(function () {
    function create_test_table(filterValue){
        const testValue = filterValue; // Example filter value
        // console.log(testValue)
        fetch(`/api/dressage_test?testValue=${testValue}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // console.log(data);

                const tableBody = $('#dressageTable tbody');
                tableBody.empty()
                const testValue = data[0].testValue;

                data[0].movements.forEach((movementObj) => {
                    movementObj.entries.forEach((entry, entryIndex) => {
                        const row = document.createElement('tr');

                        if (entryIndex === 0) {
                            const movementCell = document.createElement('td');
                            movementCell.rowSpan = movementObj.entries.length;
                            $(movementCell).css({
                                'background-color': '#002923',
                                'color': 'white',
                                'text-align': 'center'
                            });
                            movementCell.textContent = movementObj.movement;
                            row.appendChild(movementCell);
                        }

                        const codeCell = document.createElement('td');
                        codeCell.textContent = entry.code;
                        $(codeCell).css({
                            'text-align': 'center'
                        });
                        row.appendChild(codeCell);

                        const descriptionCell = document.createElement('td');
                        descriptionCell.textContent = entry.description;
                        row.appendChild(descriptionCell);

                        if (entryIndex === 0) {
                            const testCell = document.createElement('td');
                            testCell.rowSpan = movementObj.entries.length;
                            testCell.textContent = testValue;
                            testCell.className = 'testValue'
                            $(testCell).css({
                                'text-align': 'center'
                            });
                            row.appendChild(testCell);

                            const scoreCell = document.createElement('td');
                            scoreCell.rowSpan = movementObj.entries.length;
                            scoreCell.id = `${testValue}_${movementObj.movement}`
                            $(scoreCell).css({
                                'text-align': 'center'
                            });
                            const scoreInput = document.createElement('input');
                            scoreInput.type = 'number';
                            scoreInput.className = 'score_input'
                            scoreInput.setAttribute('test', testValue)
                            scoreInput.setAttribute('movement', movementObj.movement)
                            scoreInput.min = 0;
                            scoreInput.max = 10;
                            scoreInput.step = 0.1;
                            scoreCell.appendChild(scoreInput);
                            row.appendChild(scoreCell);
                        }

                        tableBody.append(row);
                    });
                });

            })
            .catch(error => console.error('Error:', error));
    }
    function generate_test_table(filterValue){
        const testValue = filterValue; // Example filter value
        fetch(`/api/save_scores?test=${testValue}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if(data.length > 0) {
                    console.log(data[0].video);
                    $('#EditScoresButton').show()
                    const test = data[0].test;
                    data[0].scores.forEach(element => {
                        let html_id = `#${test}_${element.movement}`
                        $(`${html_id} input`).val(element.score)
                        $(html_id).append(`<span class="score_view">${element.score}</span>`)

                        $(`${html_id} input`).hide()
                        // console.log(element)
                    });
                } else {
                    $('#saveScoresButton').show()
                    console.log('No Entry')
                }
            })
            .catch(error => console.error('Error:', error));
    }
    create_test_table(115)
    generate_test_table(115)
    $('#test').change(function () {
        create_test_table($('#test').val())
        generate_test_table($('#test').val())
    });

    $('#EditScoresButton').click(()=> {
        $('#saveScoresButton').show()
        $('#EditScoresButton').hide()

        $('.score_input').show()
        $('.score_view').hide()

    })

    document.getElementById('saveScoresButton').addEventListener('click', function () {
        $('#EditScoresButton').show()
        $('#saveScoresButton').hide()
        $('.score_input').hide()
        $('.score_view').show()
        const scores = [];
        document.querySelectorAll('input[type="number"]').forEach(input => {
            const score = parseFloat(input.value);
            if (!isNaN(score)) {
                scores.push({
                    movement: parseInt(input.getAttribute('movement')),
                    score: score
                });
            }
        });

        const testValue = $('.testValue').first().text();;

        const payload = {
            video: 'dressage1.mp4',
            test: testValue,
            scores: scores
        };

        console.log(payload)

        fetch('/api/save_scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                alert('Scores saved successfully!');
                location.reload()
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Error saving scores');
            });

    });

})