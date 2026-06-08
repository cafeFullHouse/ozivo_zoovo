let mediaRecorder;
let audioChunks = [];
let stream = null;

//カウント用
let count = 1;
const maxCount = 12;
const counter = document.getElementById("counter");

//録音用
const recBtn = document.getElementById("recBtn");
const stopBtn = document.getElementById("stopBtn");
const recordingAudio = document.getElementById("recordingAudio");

const answerBtn = document.getElementById("answerBtn");
const nextBtn = document.getElementById("nextBtn");

const recordingPage = document.getElementById("recordingPage");
const gameStartUI = document.getElementById("gameStartUI");
const answerPage = document.getElementById("answerPage");

const playingAudio = document.getElementById("playingAudio");

const debugBtn = document.getElementById("debug");

//ページごとに対応するMIMEを検索
const CANDIDATES = [
    "audio/webm;codecs=opus",
    "audio/ogg;codecs=opus",
    "audio/mp4",   
    "audio/wav",   
    "audio/webm",
];
const mimeType = CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
if (!mimeType) 
{
    throw new Error("対応MIMEが見つかりません");
}

//保存用
let lastBlob = null;
const savedImgs = [];
const savedAudios = [];

//画像関連
const displayImg = document.getElementById("displayImg")
let selectImgIndex = 0;
let images = [
    "img1.png",
    "img2.png",
    "img3.png",
    "img4.png",
    "img5.png",
    "img6.png",
    "img7.png",
    "img8.png",
    "img9.png",
    "img10.png",
    "img11.png",
    "img12.png"
]

//配列のシャッフル関数
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

//画像のALT表示用(image〇.pngの〇部分をALTとして表示)
function setImageErrorHandler(img) {
    img.onerror = () => {
        const match = img.src.match(/img(\d+)\./);
        if(match)
        {
            img.alt = match[1];
        } 
        else 
        {
            img.alt = "画像エラー";
        }
    };
}

shuffle(images);
console.log(images);

//初期表示
displayImg.src = images[0];
setImageErrorHandler(displayImg)

async function recBtnClick()
{
    if (!stream) 
    {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    mediaRecorder = new MediaRecorder(stream,{mimeType});

    audioChunks = [];
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        const audioURL = URL.createObjectURL(audioBlob);
        lastBlob = audioBlob;  
        recordingAudio.src = audioURL;

        recBtn.src = "recBtnBefore.png";

        const selectedImg = images[selectImgIndex];
        savedImgs.push(selectedImg);
        savedAudios.push(lastBlob);

        selectImgIndex++;

        if (selectImgIndex < images.length) 
        {
            displayImg.src = images[selectImgIndex];
            setImageErrorHandler(displayImg);
        } 
        else 
        {
            displayImg.src = "";
            displayImg.alt = "終了";
        }

        console.log("保存された画像:", savedImgs);
        console.log("保存された音声:", savedAudios);

        count++;
        counter.textContent = `${count}/${maxCount}`;

        // ⑧ 12回終わったらゲーム開始へ
        if (count > maxCount) {
            recordingPage.style.display = "none";
            gameStartUI.style.display = "block";

            setTimeout(() => {
                gameStartUI.style.display = "none";
                answerPage.style.display = "block";
            }, 2000);
        }
    };

    mediaRecorder.start();
    recBtn.src = "recBtnAfter.png";
    stopBtn.src = "stopBtnAfter.png";
};

function stopBtnClick() 
{
    mediaRecorder.stop();
    stopBtn.src = "stopBtnBefore.png"
    stopBtn.disabled = true;
};

function answerBtnClick()
{
    answerBtn.style.display = "none";
    nextBtn.style.display = "block";
}

/*
nextBtn.onclick = () =>{
    if (lastBlob) 
    {
        const selectedImg = images[selectImgIndex];
        savedImgs.push(selectedImg);
        savedAudios.push(lastBlob);

        selectImgIndex++;

        if (selectImgIndex < images.length) 
        {
            displayImg.src = images[selectImgIndex];
            setImageErrorHandler(displayImg);
        } 
        else 
        {
            displayImg.src = "";
            displayImg.alt = "終了";
        }

        console.log("保存された画像:", savedImgs);
        console.log("保存された音声:", savedAudios);
    }

    recordingAudio.src = "";
    lastBlob = null;

    if(count < maxCount)
    {
        count++;
        counter.textContent = `${count}/${maxCount}`;
        nextBtn.disabled = true;

        return;
    }
    
    recordingPage.style.display = "none";
    gameStartUI.style.display = "block";

    setTimeout(() => {
        gameStartUI.style.display = "none";
        answerPage.style.display = "block";
    }, 2000);
}
    */

debugBtn.onclick = () =>{
    const dummyData = new Uint8Array([0]); 
    const dummyBlob = new Blob([dummyData], { type: mimeType });

    // ② 12個のダミー音声を savedAudios に入れる
    savedAudios.length = 0;
    savedImgs.length = 0;

    for (let i = 0; i < 12; i++) {
        savedAudios.push(dummyBlob);
        savedImgs.push(images[i]); // 画像も12個入れておく
    }

    // ③ カウンタや状態を録音完了状態にする
    count = maxCount;
    selectImgIndex = 12;
    nextBtn.disabled = true;

    // ④ 録音ページをスキップしてゲーム開始へ
    recordingPage.style.display = "none";
    gameStartUI.style.display = "block";

    setTimeout(() => {
        gameStartUI.style.display = "none";
        answerPage.style.display = "block";
    }, 2000);
}