let bgm;
let isMusicOn = true;
let helpPanelVisible = false;
let helpPanelElements = [];
let records = []; // mảng lưu dữ liệu
let tableContainer; // nhóm chứa bảng
let tableText;
let toggleButton;
let isTableVisible = false;

const instructions = 
  'Hướng dẫn:\n' +
  '- Kéo cảm biến vào vị trí mong muốn\n' +
  '- Nhấn Start để thả bi và đo thời gian\n' +
  '- Quan sát T1, T2 và gia tốc g';


class MyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MyScene' });
    }

    preload() {
        this.load.image('vienbi', 'assets/vienbi.png');
        this.load.image('thuoc', 'assets/thuoc.png');
        this.load.image('reset', 'assets/reset.png');
        this.load.image('onoff', 'assets/onoff.png');
        this.load.image('time', 'assets/time.png');
        this.load.image('start', 'assets/start.png');
        this.load.image('mang', 'assets/mang.png');
        this.load.image('namcham', 'assets/namcham.png');
        this.load.image('cqd', 'assets/cqd.png');
        this.load.image('helpIcon', 'assets/helpicon.png');
        this.load.audio('bgm', 'assets/BG_audio.mp3');
        
    }

    create() {
    
        this.thuoc = this.add.image(290, 320, 'thuoc');
        this.mang = this.add.image(310, 280, 'mang');

        this.vienbi = this.physics.add.image(312, 550, 'vienbi');

        this.cqd = this.add.image(300, 180, 'cqd');

        this.namcham = this.add.image(312, 63, 'namcham');

        this.onoff = this.add.image(600, 450,'onoff').setInteractive();
        this.reset = this.add.image(600, 510,'reset').setInteractive();
        
        this.add.image(500, 480,'time').setOrigin(0.5);
        this.start = this.add.image(100, 480,'start').setInteractive();

        // Nút Help
        const helpBtn = this.add.image(670, 50, 'helpIcon').setScale(0.065).setInteractive();
        const tooltip = this.add.text(660, 10, 'Hướng dẫn', {
            fontSize: '14px',
            fill: '#fff',
            backgroundColor: '#333',
            padding: { left: 5, right: 5, top: 2, bottom: 2 }
        }).setVisible(false);
        helpBtn.on('pointerover', () => {
            tooltip.setVisible(true);
        });

        helpBtn.on('pointerout', () => {
            tooltip.setVisible(false);
        });
        helpBtn.on('pointerdown', () => this.showHelp());

        //Tạo giao diện bảng
        this.tableBg = this.add.rectangle(600, 100, 220, 260, 0x000000, 0.6).setOrigin(0).setVisible(false);
        this.tableText = this.add.text(640, 110, 't (s) | s(cm) ', {
            fontSize: '16px',
            fill: '#ffffff'
        }).setVisible(false);
        
        //Nút bật tắt bảng
        const toggleBtn = this.add.text(700, 35, '📋', {
            fontSize: '28px',
            padding: { x: 8, y: 4 }
        }).setInteractive();

        toggleBtn.on('pointerdown', () => {
            isTableVisible = !isTableVisible;
            this.tableBg.setVisible(isTableVisible);
            this.tableText.setVisible(isTableVisible);
        });

        //Thêm bg audio
        bgm = this.sound.add('bgm', { loop: true });
        bgm.play();

        const musicBtn = this.add.text(590, 40, '🎵', {
            fontSize: '30px', fill: '#fff'
        }).setInteractive();

        musicBtn.on('pointerdown', () => {
            isMusicOn = !isMusicOn;
            if (isMusicOn) {
                bgm.play();
                musicBtn.setText('🎵');
            } else {
                bgm.pause();
                musicBtn.setText('🔇');
            }
        });
        const tooltip6 = this.add.text(570, 10, 'Bật/ Tắt nhạc', {
            fontSize: '14px',
            fill: '#fff',
            backgroundColor: '#333',
            padding: { left: 5, right: 5, top: 2, bottom: 2 }
        }).setVisible(false);
        musicBtn.on('pointerover', () => {
            tooltip6.setVisible(true);
        });
        musicBtn.on('pointerout', () => {
            tooltip6.setVisible(false);
        });
    
        // Các mốc chia độ
        let labels = [0, 25, 50, 75, 100];

        // Tính top, bottom của thước có scale và origin
        let rulerTop = this.thuoc.y - this.thuoc.displayHeight * this.thuoc.originY;
        let rulerBottom = this.thuoc.y + this.thuoc.displayHeight * (1 - this.thuoc.originY);

        // Vẽ nhãn theo khoảng cách đều
        for (let i = 0; i < labels.length; i++) {
            let y = Phaser.Math.Linear(rulerTop, rulerBottom, i / (labels.length - 1));
            this.add.text(this.thuoc.x - 50, y, labels[i].toString(), { fontSize: '16px', color: '#000' })
                .setOrigin(0.5);
        }

        this.cqd.setInteractive({ draggable: true });

        this.valueText = this.add.text(50, 50, "0.00", { fontSize: '20px', color: '#000' });
        this.timeText = this.add.text(500, 480, "0", { fontSize: '20px', color: '#008000ff' });
        this.timeText.setOrigin(0.5);
        this.timeText.setVisible(false);
        this.input.setDraggable(this.cqd);
        
        let value = 0;
        // Hàm cập nhật giá trị (dùng chung cho lúc khởi tạo và khi drag)
        const updateValue = () => {
            let halfCqd = this.cqd.displayHeight * this.cqd.originY;
            let minY = rulerTop + halfCqd;
            let maxY = rulerBottom - halfCqd;

            // Clamp vị trí ban đầu của cqd để không vượt ngoài thước
            this.cqd.y = Phaser.Math.Clamp(this.cqd.y, minY, maxY);
            this.cqd.x = this.thuoc.x;

            let ratio = (this.cqd.y - minY) / (maxY - minY);
            value = (ratio * 100).toFixed(2);

            this.valueText.setText(value.toString());
        };

        // Cập nhật ngay từ khi khởi tạo
        updateValue();

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject === this.cqd) {
                let halfCqd = gameObject.displayHeight * gameObject.originY;
                let minY = rulerTop + halfCqd;
                let maxY = rulerBottom - halfCqd;

                let newY = Phaser.Math.Clamp(dragY, minY, maxY);
                gameObject.y = newY;
                gameObject.x = this.thuoc.x;

                updateValue(); // cập nhật khi kéo
            }
        });

        // Thêm physics cho viên bi
        this.physics.add.existing(this.vienbi);
        this.vienbi.setInteractive();

        let randomaccel = 0;
        const accel = [980.3, 979, 973.3, 989.4, 990.1, 967.4]; // gia tốc rơi tự do
        let isActive = false;   // trạng thái bật/tắt
        let isFalling = false;  // trạng thái viên bi đang rơi

        // Sự kiện click vào viên bi → đưa viên bi về nam châm
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            if (gameObject === this.vienbi) {
                this.vienbi.setPosition(
                    this.namcham.x,
                    this.namcham.y + this.namcham.displayHeight / 2 + this.vienbi.displayHeight / 2
                );
                this.vienbi.setGravityY(isActive ? 0 : 600);
            }
        });

        // Xử lý bật/tắt khi nhấn nút onoff
        this.statusCircle = this.add.circle(400, 450, 10, 0x000000);
        let clickCount = 0;
        this.onoff.setInteractive().on('pointerdown', () => {
            clickCount++;
            isActive = (clickCount % 2 === 1);

            if (isActive) {
                this.vienbi.setGravityY(0);
                this.statusCircle.setFillStyle(0xFFFF00);
            } else {
                this.timeText.setVisible(false);
                this.vienbi.setGravityY(600);
                isFalling = false;
                this.statusCircle.setFillStyle(0x000000);
            }
        });

        // Gắn sự kiện start chỉ một lần
        this.start.setInteractive().on('pointerdown', () => {
            if (isActive) {
                // Reset trước khi rơi
                this.timeText.setVisible(false);
                isFalling = true;
                randomaccel = Phaser.Utils.Array.GetRandom(accel);
                console.log("Random accel:", randomaccel);

                // Đặt lại viên bi ngay dưới nam châm
                this.vienbi.setPosition(
                    this.namcham.x,
                    this.namcham.y + this.namcham.displayHeight / 2 + this.vienbi.displayHeight / 2
                );

                // Cho viên bi rơi
                this.vienbi.setGravityY(600);
            }
        });

        this.reset.setInteractive().on('pointerdown', () => {
            if (isActive) {   // chỉ reset khi trạng thái on
                this.timeText.setText("0");
                this.timeText.setVisible(true);
            }
        });

        // Theo dõi worldstep, chỉ check khi isActive + isFalling
        this.physics.world.on('worldstep', () => {
            let marble_pos = this.mang.y + this.mang.displayHeight / 2 - this.vienbi.displayWidth;
            if (isActive && isFalling && this.vienbi.y >= this.cqd.y) {
                let time = Math.sqrt((2 * value) / randomaccel).toFixed(3);
                this.timeText.setText(time.toString());
                this.timeText.setVisible(true);
            }
            if (this.vienbi.y >= marble_pos && isFalling) {
                this.vienbi.body.setVelocity(0, 0);
                this.vienbi.body.setGravityY(0);
                this.vienbi.setY(marble_pos);

                // Ghi lại bản ghi (thời gian và quãng đường)
                let time = Math.sqrt((2 * value) / randomaccel).toFixed(3);
                records.push({ distance: value, time: time });

                // Giới hạn 10 dòng
                if (records.length > 10) records.shift();

                // Cập nhật text của bảng
                let tableTextContent = 't (s) | s (cm)\n';
                for (let i = 0; i < records.length; i++) {
                    tableTextContent += `${records[i].time} | ${records[i].distance}\n`;
                }
                this.tableText.setText(tableTextContent);

                isFalling = false; // chặn rơi tiếp
            }
            if (this.vienbi.y >= marble_pos ) {
                this.vienbi.body.setVelocity(0, 0);
                this.vienbi.body.setGravityY(0);
                this.vienbi.setY(marble_pos);
                isFalling = false; // chặn rơi tiếp
            }
        });
        // Reset giá trị của bảng
        this.namcham.setInteractive().on('pointerdown', () => {
        // Khi click vào nam châm → reset bảng
        records = [];
        this.tableText.setText('t (s) | s (cm)');
        });

    }

    
    // Tùy chỉnh nút Help
    showHelp() {
        if (helpPanelVisible) {
            // Nếu đã hiển thị thì ẩn đi
            helpPanelElements.forEach(el => el.destroy());
            helpPanelElements = [];
            helpPanelVisible = false;
            return;
        }

            // Nếu chưa có panel thì hiển thị
            const bg = this.add.rectangle(400, 230, 500, 150, 0x333333).setStrokeStyle(2, 0xffffff);
            const txt = this.add.text(180, 200, instructions, {
                fontSize: '20px', fill: '#fff'
            });
            const close = this.add.text(600, 170, '✖', { fontSize: '24px', fill: '#f66' })
                .setInteractive()
                .on('pointerdown', () => {
                    helpPanelElements.forEach(el => el.destroy());
                    helpPanelElements = [];
                    helpPanelVisible = false;
            });

            helpPanelElements.push(bg, txt, close);
            helpPanelVisible = true;
    }
    

    

}

const config = {
    type: Phaser.AUTO,
    width: 800,        // Chiều rộng game
    height: 600,       // Chiều cao game
    backgroundColor: '#eeeeee', // Màu nền
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    audio: {
        disableWebAudio: true
    },
    scene: MyScene     // Scene chạy
};

const game = new Phaser.Game(config);