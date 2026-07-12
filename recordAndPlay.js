let mediaRecorder;
let audioChunks = [];
let stream = null;

//カウント用
let count = 1;
const maxCount = 12;
const answerMaxCount = 24;
const counter = document.getElementById("counter");

//録音用
const recBtn = document.getElementById("recBtn");
const stopBtn = document.getElementById("stopBtn");
const recordingAudio = document.getElementById("recordingAudio");

const answerBtn = document.getElementById("answerBtn");
const nextBtn = document.getElementById("answerNextBtn");

const returnBtnRecording = document.getElementById("returnBtnRecording");

const recordingPage = document.getElementById("recordingPage");
const transitionPage = document.getElementById("transitionPage");
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
const savedAudios = [];

let answerList = [];
let currentAnswerIndex = 0;
const answerDisplayImg = document.getElementById("answerDisplayImg");
const answerCounter = document.getElementById("answerCounter");

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

function createRandomAnswerList()
{
    answerList = [];

    for(let i = 0; i < 12; i++)
    {
        answerList.push(i);
        answerList.push(i);
    }

    shuffle(answerList);
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

//shuffle(images);

//初期表示
displayImg.src = images[0];
setImageErrorHandler(displayImg)

function stopStream()
{
    if(stream)
    {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }
}

async function recBtnClick()
{
    if (mediaRecorder && mediaRecorder.state === "recording") {
        return;
    }

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

        // 前のURLがあれば解放
        if (recordingAudio._url) 
        {
            URL.revokeObjectURL(recordingAudio._url);
        }
        recordingAudio._url = audioURL;
        recordingAudio.src = audioURL;
        recordingAudio.load();

        recBtn.src = "recBtnBefore.png";

        savedAudios.push(lastBlob);

        count++;
        counter.textContent = `${count}/${maxCount}`;

        displayImg.src = images[count - 1];

        recordingPage.style.display = "none";
        transitionPage.style.display = "block";

        stopStream();
    };

    mediaRecorder.start();
    recBtn.src = "recBtnAfter.png";
    stopBtn.src = "stopBtnAfter.png";
};

function stopBtnClick() 
{
    if (!mediaRecorder || mediaRecorder.state !== "recording") 
    {
        return;
    }

    mediaRecorder.stop();
    stopBtn.src = "stopBtnBefore.png"
};

function returnBtnClick()
{
    recordingPage.style.display = "none";
    transitionPage.style.display = "block";
}

function goNextRecording()
{
    // ⑧ 12回終わったらゲーム開始へ
    if (count > maxCount) {
        transitionPage.style.display = "none";
        gameStartUI.style.display = "block";

        createRandomAnswerList();
        currentAnswerIndex = 0;

        setTimeout(() => {
            gameStartUI.style.display = "none";
            answerPage.style.display = "block";

            setQuestion();
        }, 2000);

        return;
    }

    if(count == 1)
    {
        returnBtnRecording.style.display = "none";
    }
    else
    {
        returnBtnRecording.style.display = "block";
    }

    transitionPage.style.display = "none";
    recordingPage.style.display = "block";
}

function returnBeforeRecording()
{
    if(count <= 1)
    {
        return;
    }

    savedAudios.pop();

    count--;
    counter.textContent = `${count}/${maxCount}`;

    if(count == 1)
    {
        returnBtnRecording.style.display = "none";
    }
    else
    {
        returnBtnRecording.style.display = "block";
    }

    displayImg.src = images[count - 1];

    recordingPage.style.display = "block";
    transitionPage.style.display = "none";
}

function answerBtnClick()
{
    const index = answerList[currentAnswerIndex];
    const answerImg = images[index];

    answerDisplayImg.src = answerImg;
    setImageErrorHandler(answerImg);

    answerBtn.style.display = "none";
    nextBtn.style.display = "block";
}

function nextBtnClick()
{
    currentAnswerIndex++;
    answerCounter.textContent = `${currentAnswerIndex}/${answerMaxCount}`;

    setQuestion();
}

function setQuestion()
{
    const index = answerList[currentAnswerIndex];
    const blob = savedAudios[index];

    const url = URL.createObjectURL(blob);
    playingAudio.src = url;
    playingAudio.load();

    // 再生終了で解放
    playingAudio.onended = () => { URL.revokeObjectURL(url); playingAudio.onended = null; };

    answerDisplayImg.src = "img0.png";
    answerDisplayImg.alt = "?";

    answerBtn.style.display = "block";
    nextBtn.style.display = "none";
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

    for (let i = 0; i < 12; i++) {
        savedAudios.push(dummyBlob);
    }

    // ③ カウンタや状態を録音完了状態にする
    count = maxCount;

    // ④ 録音ページをスキップしてゲーム開始へ
    recordingPage.style.display = "none";
    gameStartUI.style.display = "block";

    createRandomAnswerList();
    currentAnswerIndex = 0;

    setTimeout(() => {
        gameStartUI.style.display = "none";
        answerPage.style.display = "block";

        setQuestion();
    }, 2000);
}