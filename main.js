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
        
        this.add.image(500, 480,'time');
        this.add.image(100, 480,'start');

        // Các mốc chia độ
        let labels = [0, 25, 50, 75, 100];
        for (let i = 0; i < labels.length; i++) {
            let y = this.thuoc.y - this.thuoc.height / 2 + (i * this.thuoc.height / (labels.length - 1));
            this.add.text(this.thuoc.x - 50, y, labels[i].toString(), { fontSize: '16px', color: '#000' })
                .setOrigin(0.5);
        }

        this.cqd.setInteractive({draggable: true });

        this.valueText = this.add.text(50, 50, "0.00", { fontSize: '20px', color: '#000' });

        // Giới hạn kéo chỉ theo trục Y dọc thước
        this.input.setDraggable(this.cqd);
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject === this.cqd) {
                // Giới hạn trong chiều dài thước
                let minY = this.thuoc.y - this.thuoc.height / 2;
                let maxY = this.thuoc.y + this.thuoc.height / 2;
                let newY = Phaser.Math.Clamp(dragY, minY, maxY);
                gameObject.y = newY;
                gameObject.x = this.thuoc.x; // giữ nguyên x

                // Tính giá trị theo vị trí
                let ratio = (newY - minY) / (maxY - minY); // tỉ lệ từ 0 đến 1
                let value = ratio * 100; // giá trị từ 0 → 100
                value = value.toFixed(2); // chính xác 0.01

                this.valueText.setText(value.toString());
            }
        });

        this.physics.add.existing(this.vienbi);
        this.vienbi.body.setCollideWorldBounds(true);
        

        this.vienbi.setInteractive();
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            if (gameObject === this.vienbi) {
                // Đặt lại vị trí ngay dưới nam châm
                this.vienbi.setPosition(this.namcham.x, this.namcham.y + this.namcham.displayHeight / 2 + this.vienbi.displayHeight / 2);
                this.vienbi.setGravityY(300);
            }
        });

        // tạo biến vận tốc của viên bi

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