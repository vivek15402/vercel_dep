$(document).ready(function () {

    document.getElementById('save_to_db').addEventListener('click', function () {
        const table = document.getElementById('timestampsTable');
        const rows = table.querySelectorAll('tr');

        const videoSrcElement = document.querySelector('#videoTaggingPlayer source');
        const videoName = videoSrcElement ? videoSrcElement.getAttribute('src') : null;
        const timestamps = [];
        const tagNames = [];

        // Corrected to start from index 1
        for (let i = 0; i < rows.length; i++) {
            let time = '00:' + rows[i].cells[0].textContent.trim();
            let fenceName = rows[i].cells[1].getAttribute('movement').trim();

            if (time && fenceName) {
                timestamps.push(time);
                tagNames.push(fenceName);
                
            }
        }

        const jsonOutput = {
            video: 'dressage1.mp4',
            test: 115,
            timestamps: timestamps
        };

        console.log(jsonOutput);

        fetch('/api/save_scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonOutput)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                alert('Scores saved successfully!');
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Error saving scores');
            });

        // if (videoName && Object.keys(timestamps).length > 0 && tagNames.length > 0) {
        //     fetch('/api/videos', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify(jsonOutput)
        //     })
        //         .then(response => {
        //             if (!response.ok) {
        //                 throw new Error('Network response was not ok: ' + response.status);
        //             }
        //             return response.json();
        //         })
        //         .then(data => {
        //             alert('Video data saved! Check details in console.');
        //             console.log(data);
        //         })
        //         .catch(error => {
        //             console.error('Error:', error);
        //             alert('Failed to save. See console for error details.');
        //         });
        // } else {
        //     alert('Please fill in all fields correctly.');
        // }
    });

    fetch('/api/save_scores?test=115')
        .then(response => response.json())
        .then(data => {
            const events_table_body = $('.events_playlist tbody')
            // console.log(data[0].timestamp[tagName])
            data[0].scores.forEach(video => {
                // console.log(video);
                let tagging_row = `<tr class="fence_rows">
                                    <td>mm:ss</td>
                                    <td movement="movement${video.movement}">Movement ${video.movement}</td>
                                </tr>`

                $('.events_tagging tbody').append(tagging_row)
                
            });
            
            data[0].scores.forEach((video, index) => {
                // console.log(video);
                let fence_row = `<tr class="fence_rows">
                                    <td time="${data[0].timestamps[index]}">${data[0].timestamps[index]}</td>
                                    <td>Movement ${video.movement}</td>
                                    <td>${video.score}</td>
                                </tr>`

                events_table_body.append(fence_row);

                
            });

        })
        .catch(error => console.error('Error:', error));

    $('.main_container').on('click', '.events_playlist .fence_rows', function () {
        let current_timestamp = $(this).find('td:first').attr('time');
        $(this).find('td:first').text()
        seekTo(current_timestamp, 1, 'videoPlayer')
    })

    $('.main_container').on('click', '.events_tagging .fence_rows', function () {
        $(this).find('td:first').text(logCurrentTime())
    })

    $('.main_container').on('change', '#durationInput', function () {
        seekTo('00:' + $(this).val(), 0, 'videoTaggingPlayer')
    })

    function seekTo(timeString, play_status, video_html_id) {
        var parts = timeString.split(':');
        var seconds = (+parts[0]) * 3600 + (+parts[1]) * 60 + (+parts[2]);
        var video = document.getElementById(video_html_id);
        video.currentTime = seconds;
        play_status ? video.play() : null;
    }

    function logCurrentTime() {
        var video = document.getElementById('videoTaggingPlayer');
        var currentTime = video.currentTime;  // Get the current time of the video
        // console.log('Current Time:', formatTime(currentTime));
        return formatTime(currentTime)
    }

    function formatTime(timeInSeconds) {
        var hours = Math.floor(timeInSeconds / 3600);
        var minutes = Math.floor((timeInSeconds % 3600) / 60);
        var seconds = Math.floor(timeInSeconds % 60);

        // Format the time components to add leading zeros if necessary
        return [minutes, seconds]
            .map(k => k < 10 ? '0' + k : k)
            .join(':');
    }

});

