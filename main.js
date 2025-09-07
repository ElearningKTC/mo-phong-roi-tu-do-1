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
        
    }

    create() {
    
        this.thuoc = this.add.image(290, 320, 'thuoc');
        this.mang = this.add.image(310, 280, 'mang');

        this.vienbi = this.physics.add.image(312, 550, 'vienbi');

        this.cqd = this.add.image(300, 180, 'cqd');

        this.namcham = this.add.image(312, 63, 'namcham');

        const onoff = this.add.image(600, 450,'onoff').setInteractive();
        this.add.image(600, 510,'reset');
        
        this.add.image(500, 480,'time').setOrigin(0.5);
        this.add.image(100, 480,'start');

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
        this.timeText = this.add.text(500, 480, "0.00", { fontSize: '20px', color: '#008000ff' });
        this.timeText.setOrigin(0.5);
        this.timeText.setVisible(false);

        this.input.setDraggable(this.cqd);

        let accel = [980.3, 979, 973.3, 989.4, 990.1, 967.4];

        // Hàm cập nhật giá trị (dùng chung cho lúc khởi tạo và khi drag)
        const updateValue = () => {
            let halfCqd = this.cqd.displayHeight * this.cqd.originY;
            let minY = rulerTop + halfCqd;
            let maxY = rulerBottom - halfCqd;

            // Clamp vị trí ban đầu của cqd để không vượt ngoài thước
            this.cqd.y = Phaser.Math.Clamp(this.cqd.y, minY, maxY);
            this.cqd.x = this.thuoc.x;

            let ratio = (this.cqd.y - minY) / (maxY - minY);
            let value = (ratio * 100).toFixed(2);

            this.valueText.setText(value.toString());

            let randomaccel = Phaser.Utils.Array.GetRandom(accel);

            let time = ((2 * value / randomaccel) ** 0.5).toFixed(2);
            this.timeText.setText(time.toString());
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

        let isActive = false; // cờ bật/tắt

        // Sự kiện click vào viên bi
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            if (gameObject === this.vienbi) {
                // Đặt lại vị trí ngay dưới nam châm
                this.vienbi.setPosition(
                    this.namcham.x,
                    this.namcham.y + this.namcham.displayHeight / 2 + this.vienbi.displayHeight / 2
                );

                // Nếu đang bật chế độ (isActive) thì giữ nguyên, ngược lại thì rơi
                this.vienbi.setGravityY(isActive ? 0 : 600);
            }
        });

        // Xử lý bật/tắt khi nhấn nút onoff
        let clickCount = 0;
        onoff.setInteractive().on('pointerdown', () => {
            clickCount++;
            isActive = (clickCount % 2 === 1); // true nếu lẻ, false nếu chẵn

            if (isActive) {
                console.log('lẻ');
                this.timeText.setVisible(true);
                this.vienbi.setGravityY(0);
            } else {
                console.log('chẵn');
                this.timeText.setVisible(false);
                this.vienbi.setGravityY(600);
            }
        });
    }

    update() {
    let marble_pos = this.mang.y + this.mang.displayHeight / 2 - this.vienbi.displayWidth;
    if (this.vienbi.y >= marble_pos) {
        this.vienbi.body.setVelocity(0, 0);  // dừng vận tốc
        this.vienbi.body.setGravityY(0);     // tắt gravity
        this.vienbi.setY(marble_pos);               // ép tọa độ y đúng 525
    }
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
    scene: MyScene     // Scene chạy
};

const game = new Phaser.Game(config);