// แสดงค่าตัวแปร
let score = 0;
let moves = 0;
let seconds = 0;
let timerInterval;

let selectedBookId = null;
let selectedShelf = null;

// ฟังก์ชันสร้างเซ็ตหนังสือ (0 ถึง limit-1) และสลับตำแหน่งแบบสุ่ม
function generateShuffledSet(limit) {
    let books = [];
    for (let i = 0; i < limit; i++) {
        books.push(i);
    }
    // สลับตำแหน่งแบบสุ่ม
    for (let i = books.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = books[i];
        books[i] = books[j];
        books[j] = temp;
    }
    return books;
}

// กำหนดหมายเลขของหนังสือเพื่อสุ่มลงแต่ละชั้น (0 ถึง 18 ตามชื่อไฟล์ภาพ)
let shelf1Books = generateShuffledSet(19); // ชั้นบน
let shelf2Books = generateShuffledSet(19); // ชั้นกลาง
let insertLeftBooks = []; //ชั้นล่างทางซ้าย
let insertRightBooks = []; //ชั้นล่างทางขวา
let basketBooks = generateShuffledSet(18); // กองหนังสือ 18 เล่มสำหรับใส่ชั้นหนังสือ


// ปุ่ม Start Game
document.getElementById('start-btn').onclick = function() {
    // 1. ซ่อนหน้าเมนู
    document.getElementById('main-menu').style.display = 'none';
    
    // 2. โชว์ตัวเกมและกระดานคะแนน
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('scoreboard').style.display = 'block';
    
    // 3. เริ่มจับเวลาตอนที่กด Start
    timerInterval = setInterval(() => {
        seconds++;
        document.getElementById('time-display').innerText = seconds;
    }, 1000);
}

// ปุ่มเปิดหน้าต่าง How to Play
document.getElementById('instruction-btn').onclick = function() {
    document.getElementById('instruction-popup').style.display = 'flex';
}

// ปุ่มปิดหน้าต่าง How to Play
document.getElementById('close-instruction-btn').onclick = function() {
    document.getElementById('instruction-popup').style.display = 'none';
}

// ฟังก์ชันอัปเดตตัวเลขคะแนนบนหน้าจอ
function updateScore(points) {
    score += points;
    document.getElementById('score-display').innerText = score;
}

// ฟังก์ชันเช็คว่าเกมจบหรือยัง
function checkGameClear() {
    let shelf1Done = isSorted(shelf1Books);
    let shelf2Done = isSorted(shelf2Books);
    let shelf3Done = (insertLeftBooks.length === 9 && insertRightBooks.length === 9); // ฝั่งละ 9 เล่มครบ

    // ถ้าผ่านเงื่อนไขทั้ง 3 ชั้น
    if (shelf1Done && shelf2Done && shelf3Done) {
        clearInterval(timerInterval); // หยุดนาฬิกา
        document.getElementById('final-score').innerText = score;
        document.getElementById('final-time').innerText = seconds;
        document.getElementById('game-clear-popup').style.display = 'flex'; // โชว์ Popup
    }
}

// ระบบปุ่ม Back to Menu
document.getElementById('back-to-menu-btn').onclick = function() {
    window.location.reload(); 
}

// ฟังก์ชันหลักสำหรับวาดหนังสือลงบนหน้าเว็บ
function renderBooks() {
    renderShelf('shelf-1', shelf1Books);
    renderShelf('shelf-2', shelf2Books);
    renderShelf('insert-right', insertRightBooks);
    renderShelf('insert-left', insertLeftBooks);
    renderShelf('book-basket', basketBooks);
}

// ฟังก์ชันสร้างหน้าตาหนังสือแต่ละเล่ม
function renderShelf(containerId, booksArray) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    booksArray.forEach((bookNumber, index) => {
        const bookDiv = document.createElement('div');
        bookDiv.className = 'book';
        
        // ใส่ภาพพื้นหลังให้ตรงกับชื่อไฟล์ เพราะชื่อไฟล์ภาพใช้ชื่อ Book00.png - Book18.png
        let fileName = bookNumber < 10 ? `CSS/Prop/Book0${bookNumber}.png` : `CSS/Prop/Book${bookNumber}.png`;
        bookDiv.style.backgroundImage = `url('${fileName}')`;
        
        // เช็คว่าเล่มนี้ถูกคลิกเลือกอยู่หรือไม่
        if (selectedBookId === index && selectedShelf === containerId) {
            bookDiv.classList.add('selected');
        }

        bookDiv.onclick = () => handleBookClick(containerId, index, booksArray);
        container.appendChild(bookDiv);
    });
}

// ฟังก์ชันเช็คว่าหนังสือในชั้นเรียงถูกต้อง (จากน้อยไปมาก) แล้วหรือยัง
function isSorted(array) {
    for (let i = 0; i < array.length - 1; i++) {
        if (array[i] > array[i + 1]) {
            return false; // ถ้ามีเล่มซ้ายมากกว่าเล่มขวา แปลว่ายังเรียงไม่เสร็จ
        }
    }
    return true; // ถ้าเช็คผ่านหมด แปลว่าเรียงเสร็จสมบูรณ์
}

// ระบบจัดการเวลาที่ผู้เล่นคลิกหนังสือ
function handleBookClick(shelfId, index, booksArray) {
    //กรณีที่ชั้น 1 หรือชั้น 2 นั้นจัดเสร็จสิ้นแล้ว ให้เราไม่สามารถไปแตะต้องได้อีก
    if ((shelfId === 'shelf-1' || shelfId === 'shelf-2') && isSorted(booksArray)) {
        console.log(shelfId + "finished!");
        return; // คำสั่ง return จะทำหน้าที่หยุดฟังก์ชันทันที ทำให้ผู้เล่นคลิกสลับต่อไม่ได้แล้ว
    }
    
    // โหมด Bubble Sort (คลิกสลับที่เล่มติดกันบนชั้น 1 และ 2)
    if (shelfId === 'shelf-1' || shelfId === 'shelf-2') {
        if (selectedBookId === null) {
            selectedBookId = index;
            selectedShelf = shelfId;
        } else {
            if (selectedBookId === index && selectedShelf === shelfId) {
                selectedBookId = null; // ยกเลิกการเลือกถ้าคลิกซ้ำเล่มเดิม
                selectedShelf = null;
            } else if (selectedShelf === shelfId && Math.abs(selectedBookId - index) === 1) {
                // สลับตำแหน่ง (Swap) ถ้าอยู่ติดกัน
                let leftIndex = Math.min(selectedBookId, index);
                let rightIndex = Math.max(selectedBookId, index);
                
                if (booksArray[leftIndex] > booksArray[rightIndex]) {
                    // สลับถูกต้อง! (เล่มซ้ายมากกว่าเล่มขวา)
                    updateScore(2); // บวก 2 คะแนน
                } else {
                    // สลับผิด! (มันเรียงถูกอยู่แล้ว ไม่ควรสลับ)
                    updateScore(-1); // หัก 1 คะแนน
                }

                //คำสั่งเมื่อมีการขยับของหนังสือ จะทำการนับจำนวนการขยับ
                let temp = booksArray[selectedBookId];
                booksArray[selectedBookId] = booksArray[index];
                booksArray[index] = temp;
                moves++;
                document.getElementById('moves-display').innerText = moves;
                selectedBookId = null;
                selectedShelf = null;
            } else {
                // เปลี่ยนไปเลือกเล่มอื่นแทนกรณีกดซ้ำ (กดยกเลิก)
                selectedBookId = index;
                selectedShelf = shelfId;
            }
        }
        
    }
    
    // โหมด Insertion Sort (หยิบหนังสือจากกองหนังสือ)
    else if (shelfId === 'book-basket') {
        selectedBookId = index;
        selectedShelf = shelfId;
    }
    
    renderBooks();
    checkGameClear();
}

// ฟังก์ชันสำหรับแทรกหนังสือลงฝั่งซ้าย
document.getElementById('insert-left').onclick = function(e) {
    // ป้องกันไม่ให้คลิกทะลุถ้าไปโดนหนังสือที่วางอยู่แล้ว
    if (e.target !== this) return;

    if (selectedShelf === 'book-basket' && selectedBookId !== null) {
        if (insertLeftBooks.length < 9) {
            let selectedBookValue = basketBooks[selectedBookId];
            
            // ตำแหน่งต่อไปที่ต้องวาง (ถ้าชั้นว่างอยู่ ค่านี้จะเป็น 0, ถ้ามี 1 เล่มแล้ว ค่านี้จะเป็น 1)
            let expectedIndex = insertLeftBooks.length; 

            // เช็คว่าหมายเลขหนังสือตรงกับตำแหน่งช่องที่ต้องวางหรือไม่
            if (selectedBookValue === expectedIndex) {
                let bookToInsert = basketBooks.splice(selectedBookId, 1)[0];
                insertLeftBooks.push(bookToInsert);
                selectedBookId = null;
                selectedShelf = null;
                updateScore(2); // วางถูก ได้ +2 คะแนน
                renderBooks();
                checkGameClear();
            } else {
                // ถ้าหยิบผิดเล่ม แจ้งเตือน และเอาไปหักคะแนนทีหลังได้
                updateScore(-1); // วางผิด โดนหัก 1 คะแนน
                alert("Wrong book, must be book numbers " + expectedIndex);
            }
        } else {
            alert("Left shelf is full already.");
        }
    }
}

//7. ฟังก์ชันสำหรับแทรกหนังสือลงฝั่งขวา
document.getElementById('insert-right').onclick = function(e) {
    // ป้องกันไม่ให้คลิกทะลุถ้าไปโดนหนังสือที่วางอยู่แล้ว
    if (e.target !== this) return; 
    
    if (selectedShelf === 'book-basket' && selectedBookId !== null) {
        if (insertRightBooks.length < 9) {
            let selectedBookValue = basketBooks[selectedBookId];
            
            // ตำแหน่งต่อไปที่ต้องวางของฝั่งขวา (เริ่มที่หมายเลข 9 ถึง 17)
            let expectedIndex = insertRightBooks.length + 9; 

            // เช็คว่าหมายเลขหนังสือตรงกับตำแหน่งช่องที่ต้องวางหรือไม่
            if (selectedBookValue === expectedIndex) {
                let bookToInsert = basketBooks.splice(selectedBookId, 1)[0];
                insertRightBooks.push(bookToInsert);
                selectedBookId = null;
                selectedShelf = null;
                updateScore(2); // วางถูก ได้ +2 คะแนน
                renderBooks();
                checkGameClear();
            } else {
                // ถ้าหยิบผิดเล่ม แจ้งเตือน และเอาไปหักคะแนนทีหลังได้
                updateScore(-1); // วางผิด โดนหัก 1 คะแนน
                alert("Wrong book, must be book numbers " + expectedIndex);
            }
        } else {
            alert("Right shelf is full already.");
        }
    }
}

// เรียกใช้ฟังก์ชันตอนเปิดเกมครั้งแรก
renderBooks();