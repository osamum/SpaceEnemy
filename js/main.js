/********************/
/* 宇宙侵略者ゲーム  */
/* 作 : ものえおさむ */
/* 2014 年 1 月     */
/*******************/
(function () {
    window.scrollTo(0, 0);

    var thisGame = {
        
        /*--- 定数の定義 ---*/
        //ゲーム領域のサイズ
        GAME_WIDTH: 640, //768,
        GAME_HEIGHT: 640, //768,
        //ゲームの FPS
        GAME_FPS: 35,

        //点数を表示するラベルのフォント
        SCORE_LABEL_FONT: "18px Goudy Stout",
        //同ラベルの文字の色
        SCORE_LABEL_COLOR: "skyblue",
        //同ラベルの位置
        SCORE_LABEL_POSITION_X: 10,
        SCORE_LABEL_POSITION_Y: 5,
        //点数のステップ
        SCORE_STEP: 10,

        //タッチ用コントローラーの画像 
        ASSET_PIC_LEFT_SWITCH: "img/leftSwitch2.png", //透明ボタン
        ASSET_PIC_RIGHT_SWITCH: "img/rightSwitch2.png",
        ASSET_PIC_SHOOT_SWITCH: "img/shootButton.png",
        //タッチ用コントローラーのサイズ (画像サイズ準ずる)
        TOUCH_CTRL_HEIGHT: 50,
        TOUCH_CTRL_WIDTH: 50,
        //タッチ用コントローラー (ビームスイッチ) のサイズ
        TOUCH_CTRL_SHOOR_HEIGHT: 32,
        TOUCH_CTRL_SHOOR_WIDTH: 32,

        ASSET_PIC_PLAYER: "img/fighter2.png",
        INIT_PLAYER_WIDTH: 48,
        INIT_PLAYER_HEIGHT: 40,

        TOCHCA_TOP: 500,

        ASSET_PIC_BEAM: "img/beam.png",
        ASSET_PIC_BEAM2: "img/beam3.png",

        BEAM_WIDTH: 5,
        BEAM_HEIGHT: 20,
        BEAM_HIDE_POSITION_Y: -32,

        ASSET_PIC_ENEMIES: [
            "img/enemy01.png",
            "img/enemy02.png",
            "img/enemy03.png"
        ],

        ENEMY_WIDTH: 32,
        ENEMY_HEIGHT: 30,

        //母船の画像
        ASSET_PIC_MOTHERSHIP: "img/motherShip2.png",

        ASSET_PIC_TOCHKA: "img/tochka_brock2.png",

        ASSET_PIC_GAMETITLE: "img/gameTitle.png",
        ASSET_PIC_GAMEOVER: "img/gameover.png",

        KEYCODE_SPACE: 32,
        KEYCODE_Z: 90,

        BGCOLOR_SHOOTINGDOWN: "red",

        /*--- オブジェクトの
        インスタンスを格納する変数 ---*/
        game: null,
        //現在のシーン
        currentScene: null,
        //現在のステージ
        currentStage: null,
        //最大のステージ
        STAGE_MAX_NUMBER: 3,
        //ゲームのスコア
        score: 0,

        //現在のステージ
        //stage: 1,

        /*--- コントロール(画面に表示されるオブジェクト)の
        インスタンスを格納する変数 --*/
        ctrl_player: null,
        ctrl_enemies: [],
        ctrl_beam: null,
        ctrl_beam2: null,
        ctrl_motherShip: null,
        ctrl_enemiesBeams: [],
        ctrl_brockArray: [],
        ctrl_tochcaArray: [],
        ctrl_scoreLabel: null,
        ctrl_residueLabel: null,
        ctrl_stageLabel: null,

        //タッチコントロール(右)
        ctrl_touchSwitch_right: null,
        //タッチコントロール(左)
        ctrl_touchSwitch_left: null,
        //タッチスイッチコントロール(ビーム)
        ctrl_touchSwitch_Shoot: null,

        //ステージカウンター
        stageCount: 1,

        loseLimitLine_posY: 0,

        player_residue_count: 3,
        player_showup_posX : 0,
        enemy_dx: 4,
        enemy_dy: 0,
        enamiesMoveSpeed: 18,

        enamiesToalCount: 0,
        frame_count: 0,

        //ゲームで使用するコントロールのインスタンを生成して格納
        setCtrls: function () {
            //ゲームのインスタンスを生成
            thisGame.game= (function (fps, width, height) {
                var game = new Game(width, height);

                

                //フレームレートを指定
                game.fps = fps;
                //使用する画像のプレロード
                game.preload(thisGame.ASSET_PIC_PLAYER,
                    thisGame.ASSET_PIC_LEFT_SWITCH,
                    thisGame.ASSET_PIC_RIGHT_SWITCH,
                    thisGame.ASSET_PIC_SHOOT_SWITCH,
                    thisGame.ASSET_PIC_BEAM,
                    thisGame.ASSET_PIC_BEAM2,
                    thisGame.ASSET_PIC_ENEMIES[0],
                    thisGame.ASSET_PIC_ENEMIES[1],
                    thisGame.ASSET_PIC_ENEMIES[2],
                    thisGame.ASSET_PIC_TOCHKA,
                    thisGame.ASSET_PIC_MOTHERSHIP,
                    thisGame.ASSET_PIC_GAMETITLE,
                    thisGame.ASSET_PIC_GAMEOVER);
                return game;
            })(thisGame.GAME_FPS,
                thisGame.GAME_WIDTH,
                thisGame.GAME_HEIGHT);

            var createLabel = thisGame.utilitys.createLabel;
            // スコアを表示するラベルを作成
            this.ctrl_scoreLabel = createLabel("SCORE : 0",
                this.SCORE_LABEL_FONT, this.SCORE_LABEL_COLOR,
                this.SCORE_LABEL_POSITION_X, this.SCORE_LABEL_POSITION_Y);

            //ボールの残数を表示するラベルを作成
            this.ctrl_residueLabel = createLabel("LIVE : 3",
                this.SCORE_LABEL_FONT, this.SCORE_LABEL_COLOR,
                this.GAME_WIDTH - 150, this.SCORE_LABEL_POSITION_Y);

            //ステージを表示するラベルを作成
            this.ctrl_stageLabel = createLabel("STAGE : 01",
                this.SCORE_LABEL_FONT, this.SCORE_LABEL_COLOR, 
                (this.GAME_WIDTH / 2) - 90, this.SCORE_LABEL_POSITION_Y);

            thisGame.loseLimitLine_posY = thisGame.GAME_HEIGHT - thisGame.INIT_PLAYER_HEIGHT;


            return this;
        },
        initilizeGame: function () {
            var gameWidth = thisGame.GAME_WIDTH;
            var game = thisGame.game;
            var utilitys = thisGame.utilitys;

            // ZキーをAボタンとして割り当てる
            game.keybind(thisGame.KEYCODE_SPACE, "a");

            //game オブジェクトの準備が出来たら
            game.onload = function () {
                var createCtrl = thisGame.utilitys.createCtrl;
                var player_showup_posX = utilitys.getCenterPosition(gameWidth, thisGame.INIT_PLAYER_WIDTH);
                //プレイヤーのインスタンスを生成
                thisGame.ctrl_player = createCtrl(game,
                    thisGame.ASSET_PIC_PLAYER,
                    thisGame.INIT_PLAYER_WIDTH,
                    thisGame.INIT_PLAYER_HEIGHT,
                    player_showup_posX,
                    thisGame.GAME_HEIGHT - thisGame.INIT_PLAYER_HEIGHT);
                thisGame.ctrl_player.shootDownFlag = false;
                thisGame.player_showup_posX = player_showup_posX;
                //ビームのインスタンスを生成
                thisGame.ctrl_beam = createCtrl(game,
                    thisGame.ASSET_PIC_BEAM, 
                    thisGame.BEAM_WIDTH, 
                    thisGame.BEAM_HEIGHT, 
                    utilitys.getCenterPosition(gameWidth, thisGame.BEAM_WIDTH),
                    thisGame.GAME_HEIGHT + thisGame.BEAM_HEIGHT);
                thisGame.ctrl_beam.shotFlag = false;
                //タッチ用コントロールのインスタンスを生成(左)
                thisGame.ctrl_touchSwitch_left = createCtrl(game,
                    thisGame.ASSET_PIC_LEFT_SWITCH,
                    thisGame.TOUCH_CTRL_WIDTH,
                    thisGame.TOUCH_CTRL_HEIGHT, 0,
                    thisGame.GAME_HEIGHT - thisGame.TOUCH_CTRL_HEIGHT);

                //タッチ用コントロールのインスタンスを生成(右)
                thisGame.ctrl_touchSwitch_right = createCtrl(game,
                    thisGame.ASSET_PIC_RIGHT_SWITCH,
                    thisGame.TOUCH_CTRL_WIDTH,
                    thisGame.TOUCH_CTRL_HEIGHT, gameWidth - thisGame.TOUCH_CTRL_WIDTH,
                    thisGame.GAME_HEIGHT - thisGame.TOUCH_CTRL_HEIGHT);

                //タッチ用コントロールのインスタンスを生成(ビーム発射ボタン)
                thisGame.ctrl_touchSwitch_Shoot = createCtrl(game,
                    thisGame.ASSET_PIC_SHOOT_SWITCH,
                    thisGame.TOUCH_CTRL_SHOOR_WIDTH,
                    thisGame.TOUCH_CTRL_SHOOR_HEIGHT, gameWidth - (thisGame.TOUCH_CTRL_WIDTH + thisGame.TOUCH_CTRL_SHOOR_WIDTH),
                    thisGame.GAME_HEIGHT - thisGame.TOUCH_CTRL_HEIGHT);

                //母船のインスタンスを生成
                thisGame.ctrl_motherShip = createCtrl(game,
                    thisGame.ASSET_PIC_MOTHERSHIP, 64, 32, gameWidth + 32, 40);
                thisGame.ctrl_motherShip.takeOffFlag = false;
                thisGame.ctrl_motherShip.forwordLeftFlag = true;
                thisGame.ctrl_motherShip.shootDownFlag = false;

                //イベントハンドラを設定
                thisGame.setHandlers(game);
                //ステージ 1 を開始
                thisGame.routingStage(thisGame.stageCount);

                //ゲーム開始画面の表示
                thisGame.game.pushScene(thisGame.utilitys.createGameStartScene());
                
            };
            return this;
        },

        //イベントハンドラを設定
        setHandlers: function (game) {
            var leftSwitch = thisGame.ctrl_touchSwitch_left;
            var rightSwitch = thisGame.ctrl_touchSwitch_right;
            var shootSwitch = thisGame.ctrl_touchSwitch_Shoot;
            leftSwitch.addEventListener('touchstart', function () {
                game.input.right = false;
                game.input.left = true;
            });
            rightSwitch.addEventListener('touchstart', function () {
                game.input.left = false;
                game.input.right = true;
            });
            leftSwitch.addEventListener('touchend', function () {
                game.input.left = false;
            });
            rightSwitch.addEventListener('touchend', function () {
                game.input.right = false;
            });

            shootSwitch.addEventListener('touchstart', function () {
                game.input.a = true;
            });
            shootSwitch.addEventListener('touchend', function () {
                game.input.a = false;
            });
        },
        handlers: {
            //タッチ用コントロールのハンドラー
            setTouchCtrlsHandlers: function (currentScene) {
                var game = thisGame.game;
                currentScene.addEventListener('touchstart', function (e) {
                    if (e.localX < thisGame.TOUCH_CTRL_WIDTH && e.localY > thisGame._touch_ctrl_posY) {
                        game.input.right = false;
                        game.input.left = true;
                    } else if (e.localX > thisGame._touch_Right_Ctrl_posX && e.localY > thisGame._touch_ctrl_posY) {
                        game.input.left = false;
                        game.input.right = true;
                    } else if (e.localX > thisGame.thisGame._touch_Right_Ctrl_posX) {

                    }
                }, false);
            }
        },
        //ステージをルーティング
        routingStage: function (stageNumber) {
            var game = thisGame.game;

            //旧いシーンを削除
            game.popScene();

            //古いステージを解放
            thisGame.currentStage = null;
            //新しいシーンを生成
            var currentScene = new Scene();
            thisGame.currentScene = currentScene;
           
            var utilitys = thisGame.utilitys;
            utilitys.loadCommonCtrls(currentScene);

            var herfGameWidth = thisGame.GAME_WIDTH / 2;

            //現在のステージ数を表示
            thisGame.ctrl_stageLabel.text = "STAGE:0" + stageNumber;

            //現在のステージ数が最大値を超えていたら 1 に戻す
            if (thisGame.stageCount > thisGame.STAGE_MAX_NUMBER) { stageNumber = 1; };

            switch (stageNumber) {
                case 1:
                    currentScene.backgroundColor = "black";
                    
                    var stageConfig = {
                        playerBeamSpeed: 4,
                        enamiesStartPoint: 50,
                        enamiesBeamMax: 2,
                        enamiesBeamSpeed: 2
                    };
                    
                    var stage = new thisGame.Stage(game, stageConfig);

                    var sideTochca_posX = utilitys.getCenterPosition(herfGameWidth, 96);
                    utilitys.createTochica(game, currentScene, sideTochca_posX - 20, thisGame.TOCHCA_TOP)
                        .createTochica(game, currentScene, utilitys.getCenterPosition(thisGame.GAME_WIDTH, 96), thisGame.TOCHCA_TOP)
                        .createTochica(game, currentScene, sideTochca_posX + herfGameWidth + 20, thisGame.TOCHCA_TOP)
                        .setTimingMotherShip();
                    stage.loadCtrl();
                    stage.setHandlers();
                    thisGame.currentStage = stage;
                    break;
                case 2:
                    currentScene.backgroundColor = "black";

                    var stageConfig = {
                        playerBeamSpeed: 6,
                        enamiesStartPoint: 50,
                        enamiesBeamMax: 3,
                        enamiesBeamSpeed: 3
                    };

                    var stage = new thisGame.Stage(game, stageConfig);
                    utilitys.reloadExistCtrls(currentScene, thisGame.ctrl_tochcaArray);
                    thisGame.enamiesMoveSpeed = 17;
                    stage.loadCtrl();
                    stage.setHandlers();
                    thisGame.currentStage = stage;
                    break;
                case 3:
                    currentScene.backgroundColor = "black";
                    var stageConfig = {
                        playerBeamSpeed: 6,
                        enamiesStartPoint: 50,
                        enamiesBeamMax: 3,
                        enamiesBeamSpeed: 4
                    };

                    var stage = new thisGame.Stage(game, stageConfig);
                    utilitys.reloadExistCtrls(currentScene, thisGame.ctrl_tochcaArray);
                    //thisGame.enamiesMoveSpeed = 17;
                    stage.loadCtrl();
                    stage.setHandlers();
                    thisGame.currentStage = stage;
                    break;
                   
                    break;
            }
            game.pushScene(currentScene);
            
        },
        utilitys: {
            createCtrl: function (game, assetName, width, height, posX, posY) {
                var sprite = new Sprite(width, height);
                sprite.image = game.assets[assetName];
                sprite.x = posX;
                sprite.y = posY;
                return sprite;
            },
            //現在のステージを表示するラベルを生成するメソッド
            createLabel: function (labelText, fontName, fontColor, posX, posY) {
                var stageLabel = new Label(labelText);
                stageLabel.font = fontName;
                stageLabel.color = fontColor;
                stageLabel.x = posX;
                stageLabel.y = posY;
                return stageLabel;
            },
            //トーチカを作成
            createTochica: function (game, currentScene, posX, posY) {
                var tochca = new Group();
                for (var y = 0; y < 4; y++) {
                    for (var x = 0; x < 6; x++) {
                        if ((x < 2 || x > 3) || y < 2) {
                            var brock = new Sprite(16, 16);
                            brock.image = game.assets[thisGame.ASSET_PIC_TOCHKA];
                            brock.x += (16 * x);
                            brock.y += (16 * y);
                            tochca.addChild(brock);
                            brock.damageCount = 0;
                            thisGame.ctrl_brockArray.push(brock);
                        }
                    }
                }
                tochca.x = posX;
                tochca.y = posY;
                currentScene.addChild(tochca);
                thisGame.ctrl_tochcaArray.push(tochca);
                return this;
            },
            createEnemies: function (game, currentScene) {
                var enamy = null;
                var count = 0; // 敵の総数を示すカウンタを0にする
                var enemiesTypeIndex = 0;
                var ENEMY_ROW_COUNT = 5;
                var ENEMY_COL_COUNT = 12;
                var ENEMY_WIDTH = thisGame.ENEMY_WIDTH;
                var ENEMY_HEIGHT = thisGame.ENEMY_HEIGHT;
                var enamiesArray = new Array();

                //的を縦横の数だけ繰り返し生成
                for (var y = 0; y < ENEMY_ROW_COUNT; y++) {
                    for (var x = 0; x < ENEMY_COL_COUNT; x++) {
                        enamy = new Sprite(ENEMY_WIDTH, ENEMY_HEIGHT);
                        enamy.image = game.assets[thisGame.ASSET_PIC_ENEMIES[enemiesTypeIndex]];
                        enamy.x = x * ENEMY_WIDTH + (15 * x) + 32;  // X座標
                        enamy.y = y * 40 + ENEMY_HEIGHT + 40; //64; // Y座標
                        enamy.shootDownFlag = false;
                        setScore(y, enamy);
                        currentScene.addChild(enamy);
                        enamiesArray[count] = enamy;

                        count = count + 1; //敵の総数を示すカウンタを増やす
                    }
                    if (y != 1 && y != 3) {
                        enemiesTypeIndex++;
                    }
                }
                thisGame.ctrl_enemies = enamiesArray;
                thisGame.enamiesToalCount = count;
                return this;

                //敵に点数を付加
                function setScore(index, enamy) {
                    switch (index) {
                        case 0:
                            enamy.score = 50;
                            break;
                        case 1:
                            enamy.score = 20;
                            break;
                        case 2:
                            enamy.score = 20;
                            break;
                        case 3:
                            enamy.score = 10;
                            break;
                        case 4:
                            enamy.score = 10;
                            break;
                    }
                }
            },
            //ゲームスタート画面
            createGameStartScene: function () {
                var ENEMY_WIDTH = thisGame.ENEMY_WIDTH;
                var ENEMY_HIGHT = thisGame.ENEMY_HEIGHT;
                var game = thisGame.game;
                var createLabel = thisGame.utilitys.createLabel;
                var caption1 = createLabel("SCORE ADVANCE TABLE", "bold 30px Consolas", "blue", 160, 200);
                var scoreCaptionMotherShip = createLabel("---   ?", "bold 30px Consolas", "blue", 270, 250);
                var scoreCaption1 = createLabel("---   50", "bold 30px Consolas", "blue", 270, 290);
                var scoreCaption2 = createLabel("---   20", "bold 30px Consolas", "blue", 270, 330);
                var scoreCaption3 = createLabel("---   10", "bold 30px Consolas", "blue", 270, 370);
                var gameStartCaption = createLabel("PLEASE TOUCH DISPLAY.", "bold 24px Consolas", "blue", 170, 420);
                var scene = new Scene();
                scene.backgroundColor = 'rgba(255, 255, 255, 0.9)'; // シーンの背景色を設定
               

                function showGameChar(assetName, sizeW, sizeH, posX, posY) {
                    var gameChare = new Sprite(sizeW, sizeH);
                    gameChare.image = game.assets[assetName];
                    gameChare.x = posX;
                    gameChare.y = posY;
                    scene.addChild(gameChare);
                };

                var gameTitle = new Sprite(320, 70);                   // スプライトを作る
                gameTitle.image = game.assets[thisGame.ASSET_PIC_GAMETITLE];  // 画像を設定
                gameTitle.x = thisGame.utilitys.getCenterPosition(thisGame.GAME_WIDTH, 320);  // 横位置調整
                gameTitle.y = 100; // 縦位置調整

                scene.addChild(gameTitle); // シーンに追加
                scene.addChild(caption1);
             
                scene.addChild(scoreCaptionMotherShip);
                scene.addChild(scoreCaption1);
                scene.addChild(scoreCaption2);
                scene.addChild(scoreCaption3);
                scene.addChild(gameStartCaption);

                showGameChar(thisGame.ASSET_PIC_MOTHERSHIP, 64, ENEMY_HIGHT, 160, 250);
                showGameChar(thisGame.ASSET_PIC_ENEMIES[0], ENEMY_WIDTH, ENEMY_HIGHT, 175, 290);
                showGameChar(thisGame.ASSET_PIC_ENEMIES[1], ENEMY_WIDTH, ENEMY_HIGHT, 175, 330);
                showGameChar(thisGame.ASSET_PIC_ENEMIES[2], ENEMY_WIDTH, ENEMY_HIGHT, 175, 370);

                //タッチされたらゲームを開始する
                scene.addEventListener("touchstart", function () {
                    game.popScene(scene);
                }, false);

                return scene;
            },

            //ゲームオーバー画面を生成
            createGameoverScene: function () {
                var game = thisGame.game;
                var scene = new Scene();                                   // 新しいシーンを作る
                scene.backgroundColor = 'rgba(0, 0, 0, 0.5)';              // シーンの背景色を設定
                // ゲームオーバー画像を設定
                var gameoverImage = new Sprite(187,97);                   // スプライトを作る
                gameoverImage.image = game.assets[thisGame.ASSET_PIC_GAMEOVER];  // 画像を設定
                gameoverImage.x = thisGame.utilitys.getCenterPosition(thisGame.GAME_WIDTH,189);                                      // 横位置調整
                gameoverImage.y = thisGame.utilitys.getCenterPosition(thisGame.GAME_HEIGHT, 97); // 縦位置調整
                scene.addChild(gameoverImage); // シーンに追加

                //リセット処理
                scene.addEventListener("touchstart", function () {
                    thisGame.stageCount = 1;
                    thisGame.routingStage(thisGame.stageCount);
                });

                return scene;
            },

            //ゲームで共通でに使用されるコントロールをロード
            loadCommonCtrls: function (currentScene) {
                currentScene.addChild(thisGame.ctrl_player);
                currentScene.addChild(thisGame.ctrl_beam);
                currentScene.addChild(thisGame.ctrl_scoreLabel);
                currentScene.addChild(thisGame.ctrl_residueLabel);
                currentScene.addChild(thisGame.ctrl_stageLabel);
                currentScene.addChild(thisGame.ctrl_touchSwitch_left);
                currentScene.addChild(thisGame.ctrl_touchSwitch_right);
                currentScene.addChild(thisGame.ctrl_touchSwitch_Shoot);
                currentScene.addChild(thisGame.ctrl_motherShip);
            },
            //既にインスタンスが生成されているコントロールをシーンに追加する
            reloadExistCtrls: function (currentScene, ctrlsArray) {
                var length = ctrlsArray.length;
                for (var i = 0; i < length; i++) {
                    currentScene.addChild(ctrlsArray[i]);
                }
                return this;
            },
            //表示物を中央に表示するための left の値を算出する
            getCenterPosition: function (contenoreWidth, targetWidth) {
                return (contenoreWidth / 2) - (targetWidth / 2);
            },
            //プレイヤーを左右に動かす
            playerMove: function (game, gameWidth) {
                var player = thisGame.ctrl_player;
                if (player.shootDownFlag) { return this; };
                if (game.input.right) {
                    game.input.left = false;
                    if (player.x < gameWidth - thisGame.INIT_PLAYER_WIDTH) {
                        player.x += 3;
                    }
                } else if (game.input.left) {
                    game.input.right = false;
                    if (player.x > 0) {
                        player.x -= 3;
                    }
                }
                return this;
            },
            //プレイヤーのビームを進ませる
            proceedBeam: function (beam) {
                if (beam.flag) {
                    beam.y = beam.y - 8; 
                    // 画面外かどうか調べる
                    beam.flag = !(beam.y < thisGame.BEAM_HIDE_POSITION_Y);
                }
                return this;
            },
            //プレイヤーがビーム発射
            firingBeam: function (game, beam) {
                var player = thisGame.ctrl_player;
                if (!beam.flag) {
                    // Aボタンが押されたらビームを発射
                    if (game.input.a) {
                        beam.flag = true; // trueにしてビームが発射されている事を示すようにする
                        beam.x = player.x + 22; // 自機の中央から出す
                        beam.y = player.y - 11; // 自機より少し上のY座標から出す
                    }
                }
                return this;
            },
            //敵のビームを初期化
            initEnamiesBeam: function (stage, currentScene, maxBeam) {
                var enamyBeam = null;
                var enemiesBeams = [];
                var game = thisGame.game;
                for (var i = 0; i < maxBeam; i++) {
                    enamyBeam = enemiesBeams[i];
                    enamyBeam = new Sprite(thisGame.BEAM_WIDTH, thisGame.BEAM_HEIGHT);
                    enamyBeam.image = game.assets[thisGame.ASSET_PIC_BEAM2];
                    enamyBeam.existsFlag = false;  
                    enamyBeam.x = 0; 
                    enamyBeam.y = -999;  
                    currentScene.addChild(enamyBeam);
                    enemiesBeams[i] = enamyBeam;
                }
                thisGame.ctrl_enemiesBeams = enemiesBeams;
                return this;
            },
            //敵のビームを進ませる
            proceedEnamiesBeam: function (maxBeam, enamiesBeamSpeed) {
                var game = thisGame.game;
                var enamyBeam = null;
                var enemiesBeams = thisGame.ctrl_enemiesBeams;
                for (var i = 0; i < maxBeam; i++) {
                    enamyBeam = enemiesBeams[i];
                    if (!enamyBeam.existsFlag) { continue; } // レーザービームがない場合は繰り返しの先頭に
                    enamyBeam.y = enamyBeam.y + enamiesBeamSpeed; // Y座標の移動処理
                    if (enamyBeam.y > game.height) {  // 画面外か？
                        enamyBeam.existsFlag = false;  // 発射するレーザービームの存在をONにする
                    }
                    enemiesBeams[i] = enamyBeam;
                }
                return this;
            },
            //敵ビーム発射
            firingEnamiesBeam: function (enamies, maxBeam) {
                var pointer = Math.floor(Math.random() * 300); // レーザービームを発射する敵の配列位置を求める
                var enamy = enamies[pointer];
                var enamiesBeams = thisGame.ctrl_enemiesBeams;
                var enamyBeam = null;
                if (!enamy || enamy.y < 0) { return this; } // 敵が存在しない場合は発射しない
                for (var i = 0; i < maxBeam; i++) {
                    enamyBeam = enamiesBeams[i];
                    if (!enamyBeam.existsFlag) { // 空いているレーザービームの配列要素があるか
                        enamyBeam.existsFlag = true; // 発射するレーザービームの存在をONにする
                        enamyBeam.x = enamy.x + 14; // X座標を設定 
                        enamyBeam.y = enamy.y + 16; // Y座標を設定
                        return this;  // 以後の処理はしない
                    }
                }
                return this;
            },
            //敵の動作
            moveEnamies: function (enemies, gameWidth) {
                var enamiesMoveSpeed = thisGame.enamiesMoveSpeed;
                if (thisGame.frame_count == enamiesMoveSpeed) {
                    var reverseFlag = false;
                    var enemy = null;
                    var enemy_dx = thisGame.enemy_dx;
                    var enemy_dy = thisGame.enemy_dy;
                    var length = enemies.length;

                    for (var i = 0; i < length; i++) {
                        enemy = enemies[i];
                        //撃墜されていたら
                        if (enemy.shootDownFlag) {
                            if (enemy.y > 0) { enemy.y = -500; }
                        }else{
                            enemy.x += enemy_dx;
                            enemy.y += enemy_dy;
                            enemy.frame = (enemy.frame == 0) ? 1 : 0;
                            if (enemy.x >= gameWidth- 32 || enemy.x < 0) {
                                reverseFlag = true;
                            };
                        }
                    }
                    // 左右どちらかの端に到達した敵がいた場合の処理
                    if (reverseFlag) {
                        enemy_dx = -enemy_dx;
                        enemy_dy = 16;
                        if (enamiesMoveSpeed > 1) enamiesMoveSpeed--;
                    } else {
                        enemy_dy = 0;
                    }
                    if (thisGame.frame_count >= enamiesMoveSpeed) { thisGame.frame_count = 0; };
                    thisGame.enemy_dx = enemy_dx;
                    thisGame.enemy_dy = enemy_dy;
                }
                thisGame.enamiesMoveSpeed = enamiesMoveSpeed;
                return this;
            },
            //母船を動かす
            moveMotherShip: function (motherShip, gameWidth) {
                if (motherShip.takeOffFlag) {
                    var stopPoint;
                    var enamiesMoveSpeed = thisGame.enamiesMoveSpeed;
                    if (motherShip.forwordLeftFlag) {
                        stopPoint = -motherShip.width;
                        if (motherShip.x > stopPoint) {
                            motherShip.x--;
                        } else {
                            motherShip.takeOffFlag = false;
                            motherShip.forwordLeftFlag = false;
                        }
                    } else {
                        stopPoint = gameWidth + motherShip.width;
                        if (motherShip.x < stopPoint) {
                            motherShip.x++;
                        } else {
                            motherShip.takeOffFlag = false;
                            motherShip.forwordLeftFlag = true;
                        }
                    }
                }
                return this;
            },
            //母船が表示されるタイミングを設定
            setTimingMotherShip: function () {
                var intervalSec = thisGame.utilitys.getRandumNumeric(30000, 60000);
                setInterval(function () {
                    thisGame.ctrl_motherShip.takeOffFlag = true;
                }, intervalSec);
            },
            //トーチカとのヒット判定
            isHitTochca: function (beam, beamMax, enamies) {
                var tochca = null;
                var enamy = null;
                var enamyBeam = null;
                var enemiesBeams = thisGame.ctrl_enemiesBeams;
                var tochcaArray = thisGame.ctrl_brockArray;
                var tochcaMax = tochcaArray.length;
                var enamiesMax = enamies.length;
                for (var i = 0; i < tochcaMax; i++) {
                    tochca = tochcaArray[i];
                    for (var cnt = 0; cnt < beamMax; cnt++) {
                        enamyBeam = enemiesBeams[cnt];
                        //敵のビームとのヒット判定
                        if (enamyBeam.existsFlag) {
                            if (tochca.damageCount < 3) {
                                if (tochca.intersect(enamyBeam)) {
                                    enamyBeam.existsFlag = false;
                                    enamyBeam.y = -999;
                                    eraseTochca();
                                }
                            }
                        }
                        if (tochca.y !== -999) {
                            //プレイヤーのビームとのヒット判定
                            if (beam.intersect(tochca)) {
                                beam.y = -999;
                                eraseTochca();
                            }
                        }
                        //トーチカを消す処理
                        function eraseTochca() {
                            tochca.damageCount++;
                            if (tochca.damageCount < 3) {
                                tochca.frame = tochca.damageCount;
                            } else { tochca.y = -999; }
                        }
                    }
                    //敵そのものとのヒット判定
                    for (var i2 = 0; i2 < enamiesMax; i2++) {
                        enamy = enamies[i2];
                        if (enamy.y > (thisGame.TOCHCA_TOP - enamy.height)) {
                            if (tochca.y > -999) {
                                if (enamy.intersect(tochca)) {
                                    tochca.y = -999;
                                }
                            }
                        }
                    }
                }
                return this;
            },
            //敵の被弾判定
            isHitEnamies: function (beam, enemies) {
                var enemy = null;
                var score = thisGame.score;
                var leftEnd = 500;
                var rightEnd = 0;
                var tochcaArray = thisGame.ctrl_brockArray;
                var tochcaLength = tochcaArray.length;
                var enemieslenght = enemies.length;
                for (var i = 0; i < enemieslenght; i++) {
                    enemy = enemies[i];

                    //敵がプレイヤーの位置を超えたらゲームオーバー
                    if (thisGame.loseLimitLine_posY < enemy.y) {
                        thisGame.utilitys.gameOver();
                        return this;
                    }
                    if (!enemy.shootDownFlag){
                        if (beam.intersect(enemy)) {
                            enemy.frame = 2;
                            beam.flag = false;
                            beam.y = thisGame.BEAM_HIDE_POSITION_Y;
                            enemy.shootDownFlag = true;
                            score += enemy.score;
                            thisGame.enamiesToalCount--;

                        } else {
                            if (leftEnd > enemy.x) { leftEnd = enemy.x };
                            if (rightEnd < enemy.x) { rightEnd = enemy.x };
                        }
                    }
                }
                thisGame.score = score;
                thisGame.ctrl_scoreLabel.text = "SCORE: " + score;
                return this;
            },
            //プレイヤーのヒット判定
            isHitPlayer: function (beamMax) {
                var enamyBeam = null;
                var player = thisGame.ctrl_player;
                if (player.shootDownFlag) { return this };
                var enemiesBeams = thisGame.ctrl_enemiesBeams;
                for (var i = 0; i < beamMax; i++) {
                    enamyBeam = enemiesBeams[i];
                    if (enamyBeam.existsFlag){
                        if (player.intersect(enamyBeam)) {
                            //alert("当たっちった...");
                            player.shootDownFlag = true;
                            player.frame = 1;
                            thisGame.currentScene.backgroundColor = thisGame.BGCOLOR_SHOOTINGDOWN;
                            if (thisGame.player_residue_count > 0) {
                                setTimeout(function () {
                                    player.frame = 0;
                                    player.shootDownFlag = false;
                                    player.x = thisGame.player_showup_posX;
                                    thisGame.currentScene.backgroundColor = "black";
                                }, 1500);
                                thisGame.player_residue_count--;
                                thisGame.ctrl_residueLabel.text = "LIVE :" + thisGame.player_residue_count;
                            } else {
                                //ゲームオーバーの処理
                                thisGame.utilitys.gameOver();
                            }
                        }
                    }
                }
                return this;
            },
            //母船(UFO) とビームの当たり判定
            isHitMotherShip: function (motherShip, beam, gameWidth) {
                
                if (motherShip.shootDownFlag) {
                    if (thisGame.frame_count == 0) {
                        motherShip.frame = 0;
                        motherShip.shootDownFlag = false;
                        motherShip.takeOffFlag = false;
                        motherShip.x = (motherShip.forwordLeftFlag) ? gameWidth + motherShip.width : -motherShip.width;
                        beam.y = thisGame.BEAM_HIDE_POSITION_Y;
                    }
                }else{
                    if (motherShip.intersect(beam)) {
                    motherShip.frame = 1;
                    motherShip.shootDownFlag = true;
                    }
                }
                return this;
            },
            //ステージのリソースを解放
            creaStageResoure: function (currentScene) {
                var enamies = thisGame.ctrl_enemies;
                var length = enamies.length;
                for (var i = 0; i < length; i++) {
                    currentScene.removeChild(enamies[i]);
                }
                thisGame.ctrl_enemies = null;
                var enamiesBeam = thisGame.ctrl_enemiesBeams;
                length = enamiesBeam.length;
                for (var i = 0; i < length; i++) {
                    currentScene.removeChild(enamiesBeam[i]);
                }
                thisGame.ctrl_enemiesBeams = null;
            },
            //指定された範囲の乱数を返す
            getRandumNumeric: function (nFrom, nTo) {
                return nFrom + Math.floor(Math.random() * nTo);
            },

            //ゲームオーバーの処理
            gameOver: function () {
                thisGame.utilitys.creaStageResoure(thisGame.game.currentScene);
                thisGame.game.pushScene(thisGame.utilitys.createGameoverScene());
            }
        },
        Stage: function (game, stageConfig) {
            var enamiesBeamMax = stageConfig.enamiesBeamMax;
            var enamiesBeamSpeed = stageConfig.enamiesBeamSpeed;
            var currentScene = thisGame.currentScene;
            var thisStage = this;
            var beam = null;
            var gameWidth = thisGame.GAME_WIDTH;
            var enemies = null;
            var motherShip = null;
            var utilitys = thisGame.utilitys;

            this.loadCtrl = function () {
                utilitys.initEnamiesBeam(thisStage, currentScene, enamiesBeamMax)
                    .createEnemies(game, currentScene);
                beam = thisGame.ctrl_beam;
                enemies = thisGame.ctrl_enemies;
                motherShip = thisGame.ctrl_motherShip;
            },

            this.setHandlers = function () {
                currentScene.addEventListener(Event.ENTER_FRAME, thisStage.handlers.enterFrame, false);
                return this;
            }
            this.handlers = {
                enterFrame : function () {
                    thisGame.frame_count++

                    if (beam === null) { return;};

                    if (beam.flag) {
                        utilitys.isHitEnamies(beam, enemies)
                    }
                    utilitys.playerMove(game, gameWidth)
                        .firingBeam(game, beam)
                        .proceedBeam(beam)
                        .moveEnamies(enemies, gameWidth)
                        .firingEnamiesBeam(enemies, enamiesBeamMax)
                        .proceedEnamiesBeam(enamiesBeamMax, enamiesBeamSpeed)
                        .isHitPlayer(enamiesBeamMax)
                        .isHitTochca(beam, enamiesBeamMax, enemies)
                        .moveMotherShip(motherShip, gameWidth)
                        .isHitMotherShip(motherShip, beam, gameWidth);
                    if (thisGame.enamiesToalCount <= 0) {
                        var currentScene = thisGame.currentScene;
                        currentScene.removeEventListener(Event.ENTER_FRAME, thisStage.handlers.enterFrame, false);
                        utilitys.creaStageResoure(currentScene);
                        thisGame.stageCount++;
                        thisGame.routingStage(thisGame.stageCount);
                    }
                }
            };

        }
    };

    enchant();
    window.onload = function () {
        thisGame.setCtrls().initilizeGame().game.start();
    }
})();