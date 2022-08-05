// Render song
// Scroll top
// Load current data song
// Play/ pause/ seekTime  
// volume change
// CD rotate
// Next/ Previous
// Random
// Next/ Repeat when end
// Active song
// Scroll active song into view
// Play song when clicked

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'TRONGHUY'

const playlist = $('.playlist')
const playlistList = $('.playlist-list')
const cd = $('.cd')
const heading = $('header h2')
const author = $('header p')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progressBar = $('.progress-bar')
const progress = $('#progress')
const audioCurrentTime = $('.current-time')
const audioDuration = $('.duration-time')
const volumeBtnSlash = $('.btn-volume-slash')
const volumeBtnMedium = $('.btn-volume-medium')
const volumeBtnDown = $('.btn-volume-down')
const volumeBtnUp = $('.btn-volume-up')
const progressVolume = $('#volume-progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const canvas = $('#canvas')

let runOnlyOnce = false

const app = {
    currentTime: '',
    isPlaying : false,
    isRandom : false,
    isRepeat : false,
    isMobile: false,
    currentIndex: 0,
    isOnMouseAndTouchOnProgress: false,
    isMuted: false,
    currentVolume: 1,
    volumeBeforeMuted: 0,
    random : [],
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Faded',
            singer: 'Alan Walker',
            path: './assets/music/y2mate.com - Alan Walker  Faded Lyrics.mp3',
            image: './assets/img/img-3.jpg'
        },
        {
            name: 'Lily',
            singer: 'Alan Walker',
            path: './assets/music/y2mate.com - Alan Walker K391  Emelie Hollow  Lily Lyrics.mp3',
            image: './assets/img/img-2.jpg'
        },
        {
            name: 'Attention',
            singer: 'Charlie Puth',
            path: './assets/music/y2mate.com - Charlie Puth  Attention Lyrics.mp3',
            image: './assets/img/img-1.jpg'
        },
        {
            name: 'Thanh trừ',
            singer: 'Vương Hân Thần, Tô Tinh Tiệp',
            path: './assets/music/y2mate.com - Vietsub Thanh Trừ  Vương Hân Thần Tô Tinh Tiệp  清空  王忻辰蘇星婕.mp3',
            image: './assets/img/img-4.jpg'
        },
        {
            name: 'Đảo Không Người',
            singer: 'Nhậm Nhiên',
            path: './assets/music/y2mate.com - VietsubTiktok Đảo Không Người  Nhậm Nhiên  无人之岛  任然  Nhạc Hoa tâm trạng  Nhạc Hot Tik tok.mp3',
            image: './assets/img/img-5.jpg'
        },
        {
            name: 'See You Again',
            singer: 'Charlie Puth',
            path: './assets/music/y2mate.com - Wiz Khalifa  See You Again ft Charlie Puth Official Video Furious 7 Soundtrack.mp3',
            image: './assets/img/img-6.jpg'
        },
        {
            name: 'Cá Lớn',
            singer: 'Châu Thâm',
            path: './assets/music/y2mate.com - Vietsub Cá lớn  Châu Thâm OST Đại Ngư Hải Đường.mp3',
            image: './assets/img/img-11.jpg'
        },
        {
            name: 'On My Way',
            singer: 'Alan Walker',
            path: './assets/music/y2mate.com - Alan Walker Sabrina Carpenter  Farruko   On My Way.mp3',
            image: './assets/img/img-9.jpg'
        },
        {
            name: 'Havana',
            singer: 'Camila Cabello',
            path: './assets/music/y2mate.com - Camila Cabello  Havana Audio ft Young Thug.mp3',
            image: './assets/img/img-7.jpg'
        },
        {
            name: 'Shape of you',
            singer: 'Ed Sheeran',
            path: './assets/music/y2mate.com - Ed Sheeran  Shape of You Official Music Video.mp3',
            image: './assets/img/img-8.jpg'
        },
        {
            name: 'Vây Giữ',
            singer: 'Vương Tĩnh, Văn Không Mập',
            path: './assets/music/y2mate.com - Vietsub Vây Giữ  Vương Tĩnh Văn Không Mập  沦陷  王靖雯不胖.mp3.webm',
            image: './assets/img/img-10.jpg'
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return`
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="index">
                    ${index < 9 ? `0${index + 1}` : index + 1}
                </div>
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="music-waves ${index === this.currentIndex ? 'active' : ''}">  
                    <span></span>  
                    <span></span>  
                    <span></span>  
                    <span></span>  
                    <span></span>  
                </div>
            </div>
        `
        })
        playlistList.innerHTML = htmls.join('')
    },

    // Get the first song
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function() {
        window.onresize = function() {
            if (window.innerWidth < 740) {
                app.isMobile = true
            } else {
                app.isMobile = false
            }
            app.setConfig("isMobile", app.isMobile)
        }

        const cdWidth = cd.offsetWidth
        // Handle CD enlargement / reduction
        document.onscroll = function() {
            if(app.isMobile) {
                const scrollTop =  document.documentElement.scrollTop || window.scrollY
                const newCdWidth = cdWidth - scrollTop
    
                cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
                cd.style.opacity = newCdWidth / cdWidth
            } else {
                cd.style.width = '250px'
                cd.style.opacity = '1'
            }
        }

        // Stat and stop rotate cdThumb
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 8000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // Play / pause audio when playBtn is clicked
        playBtn.onclick = function() {
            if (app.isPlaying) {
                pauseAudio()
            }else{
                playAudio()
            }
        }

        // Play
        function playAudio() {
            audio.play()
            app.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
            $$('.music-waves.active span').forEach(wave => wave.classList.add('active'))

            if (!runOnlyOnce) {
                app.audioVisualizer()
                runOnlyOnce = true
            }
        }

        // Pause
        function pauseAudio() {
            audio.pause()
            app.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
            $$('.music-waves.active span').forEach(wave => wave.classList.remove('active'))
        }

        // When the song progress changes
        audio.ontimeupdate = function() {

            // update width for progress bar
            if (audio.duration && !app.isOnMouseAndTouchOnProgress) {
                const progressPercent = Math.floor(
                  (audio.currentTime / audio.duration) * 100
                );
                progress.value = progressPercent
                app.setConfig("currentTime", audio.currentTime)
            }

            // click mouse
            progress.onmousedown = function() {
                app.isOnMouseAndTouchOnProgress = true
            }

            // ckick by hands
            progress.ontouchstart = function() {
                app.isOnMouseAndTouchOnProgress = true
            }

            // load current time when playing
            let currentMinute = Math.floor(audio.currentTime / 60)
            let currentSecond = Math.floor(audio.currentTime % 60)
            if(currentSecond < 10) {
                currentSecond = `0${currentSecond}`
            }
            audioCurrentTime.textContent = `${currentMinute}:${currentSecond}`

            // Total time of audio
            audio.onloadeddata = function() {
                let totalMinute = Math.floor(audio.duration / 60)
                let totalSecond = Math.floor(audio.duration % 60)
                if(totalSecond < 10) {
                    totalSecond = `0${totalSecond}`
                }
                audioDuration.innerText = `${totalMinute}:${totalSecond}`
            }
        }
        progress.oninput = function(e) {
            if (audio.duration) {
                const seekTime = audio.duration / 100 * e.target.value
                audio.currentTime = seekTime
                app.isOnMouseAndTouchOnProgress = false
            }
        }
                    
        // progress audio update when click
        // progress.addEventListener('click', (e)=>{
        //     let progressWidthValue = progressBar.clientWidth
        //     let clickOffSetX = e.offsetX
        //     let songDuration = audio.duration
        //     audio.currentTime = (clickOffSetX * songDuration / progressWidthValue)
        //     app.isOnMouseAndTouchOnProgress = false
        // })
        
        // click to turn on / off volume
        volumeBtnUp.onclick = function() {
            muteOrUnmuteVolume()
        }

        volumeBtnDown.onclick = function() {
            muteOrUnmuteVolume()
        }

        volumeBtnMedium.onclick = function() {
            muteOrUnmuteVolume()
        }

        volumeBtnSlash.onclick = function() {
            muteOrUnmuteVolume()
        }

        // Handle muted/ unmuted volume
        function muteOrUnmuteVolume () {
            app.isMuted = !app.isMuted
            if(app.isMuted) {
                app.volumeBeforeMuted = app.currentVolume
                audio.muted = true
                progressVolume.value = 0
                audio.volume = 0
                app.currentVolume = 0
            } else {
                audio.muted = false
                app.currentVolume = app.volumeBeforeMuted
                progressVolume.value = app.currentVolume * 100
                audio.volume = app.currentVolume
            }
            app.setConfig('volumeBeforeMuted', app.volumeBeforeMuted)
            app.setConfig('isMuted', app.isMuted)
            app.setConfig('currentVolume', app.currentVolume)
            app.changeStyleVolume()

        }

        // Handle change volume 
        progressVolume.oninput = function(e) {
            audio.muted = false
            audio.volume = e.target.value / 100
            app.currentVolume = audio.volume
            app.changeStyleVolume()
            app.setConfig('currentVolume', app.currentVolume)
        }

        // Click next btn
        nextBtn.onclick = function() {
            if(app.isRandom) {
                app.randomSong()
            } else {
                app.nextSong()
            }
            playAudio()
            app.scrollToActiveSong()
        }

        // Click prev btn
        prevBtn.onclick = function() {
            if(app.isRandom) {
                app.randomSong()
            } else {
                app.prevSong()
            }
            playAudio()
            app.scrollToActiveSong()
        }

        // Click random Btn
        randomBtn.onclick = function() {
            app.isRandom = !app.isRandom
            app.setConfig('isRandom', app.isRandom)
            randomBtn.classList.toggle('active', app.isRandom)
        }

        // Click repeat btn
        repeatBtn.onclick = function() {
            app.isRepeat = !app.isRepeat
            app.setConfig('isRepeat', app.isRepeat)
            repeatBtn.classList.toggle('active', app.isRepeat)
        }

        // Play song when clicked playlist
        playlistList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode) {
                app.currentIndex = Number(songNode.dataset.index)
                app.loadCurrentSong()
                playAudio()
            }
        }

        // Handle when audio ended
        audio.onended = function() {
            if(app.isRepeat) {
                playAudio()
            } else {
                nextBtn.click()
            }
        }

        // Keyboard events
        window.onkeydown = function(e) {
            switch(e.keyCode) {
                case 32:
                    e.preventDefault()
                    playBtn.click()
                    break
                case 179:
                    e.preventDefault()
                    playBtn.click()
                    break
                case 37:
                    e.preventDefault()
                    audio.currentTime -= 5
                    break
                case 39:
                    e.preventDefault()
                    audio.currentTime += 5
                    break
                case 176:
                    e.preventDefault()
                    nextBtn.click()
                    break
                case 177:
                    e.preventDefault()
                    prevBtn.click()
                    break
            }
        }
    },
    
    // change style volume
    changeStyleVolume: function () {
        if (app.currentVolume === 0) {
            volumeBtnSlash.style.display = 'flex'
            volumeBtnDown.style.display = 'none'
            volumeBtnMedium.style.display = 'none'
            volumeBtnUp.style.display = 'none'
        }
        else if (app.currentVolume > 0 && app.currentVolume <= 0.333333333333) {
            volumeBtnSlash.style.display = 'none'
            volumeBtnDown.style.display = 'flex'
            volumeBtnMedium.style.display = 'none'
            volumeBtnUp.style.display = 'none'
        }
        else if (app.currentVolume > 0.333333333333 && app.currentVolume <= 0.6666666667) {
            volumeBtnSlash.style.display = 'none'
            volumeBtnDown.style.display = 'none'
            volumeBtnMedium.style.display = 'flex'
            volumeBtnUp.style.display = 'none'
        }
        else if(app.currentVolume > 0.6666666667 && app.currentVolume <= 1) {
            volumeBtnSlash.style.display = 'none'
            volumeBtnDown.style.display = 'none'
            volumeBtnMedium.style.display = 'none'
            volumeBtnUp.style.display = 'flex'
        }
    },    
    
    setDefaultState: function() {
        progressVolume.value = (app.currentVolume * 100)
        audio.volume = app.currentVolume  
        app.changeStyleVolume()

        randomBtn.classList.toggle('active', app.isRandom)
        repeatBtn.classList.toggle('active', app.isRepeat)
    },

    scrollToActiveSong: function() {
        $('.song.active').scrollIntoView({
            behavior: 'smooth',
            block: 'end'
        })
    },

    // Render the data of first song
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
        author.textContent = this.currentSong.singer

        if (this.currentIndex == this.config.currentIndex) {
            audio.currentTime = this.config.currentTime
        } else {
            audio.currentTime = 0
        }

        this.setConfig("currentIndex", this.currentIndex)

        // Active song
        if($(`.song.active`)) {
            $(`.song.active`).classList.remove('active')
            $(`.music-waves.active`).classList.remove('active')
        }
        $$('.song').forEach((song, index) => {
            if (index == app.currentIndex) {
                song.classList.add('active');
                $$('.music-waves')[index].classList.add('active');
            }
        });
    },

    nextSong: function() {
        this.currentIndex++
        if(app.currentIndex >= app.songs.length) {
            app.currentIndex = 0
        }
        this.loadCurrentSong()

    },

    prevSong: function() {
        this.currentIndex--
        if(app.currentIndex < 0) {
            app.currentIndex = app.songs.length - 1
        }
        this.loadCurrentSong()
    },
    
    randomSong: function() {
        let newIndex
        if(app.random.length >= app.songs.length) {
            app.random = []
        }
        do {
            newIndex = Math.floor(Math.random() * app.songs.length)
        } while(app.random.find(num => newIndex == num) !== undefined || newIndex === app.currentIndex)
        app.currentIndex = newIndex
        app.random.push(newIndex)
        this.loadCurrentSong()
    },

    loadConfig: function() {
        app.isRandom = app.config.isRandom || app.isRandom
        app.isRepeat = app.config.isRepeat || app.isRepeat
        app.currentIndex = app.config.currentIndex || app.currentIndex
        app.isMobile= app.config.isMobile || app.isMobile
        app.isMuted = app.config.isMuted || app.isMuted
        app.currentTime = app.config.currentTime || app.currentTime
        app.currentVolume = app.config.currentVolume >= 0 ? app.config.currentVolume : app.currentVolume
        app.volumeBeforeMuted = app.config.volumeBeforeMuted >= 0 ? app.config.volumeBeforeMuted : app.volumeBeforeMuted
    },

    audioVisualizer: function() {
        const _this = this
        var BAR_PAD = 10
        var BAR_WIDTH = 5
        var MAX_BARS = 80
        
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)()

        // Create a MediaElementAudioSourceNode
        // Feed the HTMLMediaElement into it
        var source  = audioCtx.createMediaElementSource(audio)

        var analyser = audioCtx.createAnalyser()
        
        // canvas.width = window.innerWidth * 0.8
        // canvas.height = window.innerHeight * 0.4

        canvas.width = 840
        canvas.height = 300

        var ctx = canvas.getContext("2d")

        source.connect(analyser)
        analyser.connect(audioCtx.destination)

        var bufferLength = analyser.frequencyBinCount

        var dataArray = new Uint8Array(bufferLength)
        // console.log(bufferLength)

        var WIDTH = canvas.width
        var HEIGHT = canvas.height

        function renderFrame() {
            requestAnimationFrame(renderFrame)

            analyser.getByteFrequencyData(dataArray)
        
            ctx.clearRect(0, 0, WIDTH, HEIGHT)

            var len = dataArray.length - (Math.floor(dataArray.length / MAX_BARS) * 4)
            var maxValue = 255
            var step = Math.floor(len / MAX_BARS)
            var quantityDot = (WIDTH / MAX_BARS) * 1.2
            var x = BAR_WIDTH
            var height = (HEIGHT - (BAR_PAD * 2))

            for (var i = 0; i < len; i += step) {
                var v = (dataArray[i] / maxValue)
                var h = v * height
                var y = height / 2 - h / 2
                ctx.beginPath()
                if(_this.config.theme === "dark") {
                    ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
                    ctx.strokeStyle = "rgb(27,205,166,.9)"
                } else {
                    ctx.shadowColor = "rgba(255, 255, 255, 0.5)"
                    ctx.strokeStyle = "rgb(252,0,71,0.9)"
                }
                ctx.shadowBlur = 8
                ctx.shadowOffsetX = 0
                ctx.shadowOffsetY = 4
                ctx.lineWidth = BAR_WIDTH
                ctx.lineCap = 'round'
                ctx.moveTo(x, y)
                ctx.lineTo(x, y + h)
                ctx.stroke()
                x += quantityDot + 1
            }
        }
        renderFrame()
    },

    changeTheme: function() {
        const _this = this
        const toggleSwitch = $('.theme-switch-label input[type="checkbox"]')
        const currentTheme = this.config.theme

        if(currentTheme) {
            document.documentElement.setAttribute("data-theme", currentTheme)

            if (currentTheme === "dark") {
                toggleSwitch.checked = true
            }
        }

        function switchTheme(e) {
            if (e.target.checked) {
                document.documentElement.setAttribute("data-theme", "dark")
                _this.setConfig('theme', "dark")
            } else {
                document.documentElement.setAttribute("data-theme", "light")
                _this.setConfig('theme', "light")
            }
        }

        toggleSwitch.addEventListener("change", switchTheme, false);
    },

    start: function() {
        this.loadConfig()

        this.defineProperties()

        this.handleEvents()

        this.render()

        this.loadCurrentSong()

        this.setDefaultState()
        
        this.changeTheme()
    }
}
app.start()
