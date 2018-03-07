var proto = require("../../data_pb");
import {BoardBehavior, EmphasizeHoveredObject} from "./boardBehavior.js";
import {Player, User} from "../player.js";
import {RobberRenderer} from "./webgl/robberRenderer.js";
import {ChitRenderer} from "./webgl/chitRenderer.js";
import {HexRenderer} from "./webgl/hexRenderer.js";
import {PortRenderer} from "./webgl/portRenderer.js";
import {NodeRenderer} from "./webgl/nodeRenderer.js";
import {EdgeRenderer} from "./webgl/edgeRenderer.js";
import {CityRenderer} from "./webgl/cityRenderer.js";
import {TownRenderer} from "./webgl/townRenderer.js";
import {RoadRenderer} from "./webgl/roadRenderer.js";
import {PortPickerRenderer} from "./webgl/portPickerRenderer.js";
import {HexPartRenderer} from "./webgl/hexPartRenderer.js";
import {Hex} from "../hex.js";
import {Chit} from "../chit.js";
import {Port} from "../port.js";
import {Util} from "../util.js";
import {Road} from "../road.js";
import {Town} from "../town.js";
import {City} from "../city.js";
import {KeyListener} from "./keyListener.js";

export class BuildRoad extends BoardBehavior {
    constructor(player, keyListener, canCancel) {
        super();

        this.player = player;
        canCancel = canCancel || false;
        this.emphasizeHoveredObject = new EmphasizeHoveredObject(r => r instanceof EdgeRenderer);
        this.promise = new Promise((ok, fail) => {
            this.ok = ok;
            this.fail = fail;
        });
        if (canCancel) {
            this.removeSubscription = keyListener.escape(() => this.fail(new Error("Cancelled building a new town")));
        }
    }
    start(boardRenderer) {
        this.boardRenderer = boardRenderer;
        var edges = this.boardRenderer.board.getAllEdges();
        var roadEdges = this.boardRenderer.board.roads.map.keys();
        var edgesToShow = Util.except(edges, roadEdges);
        this.boardRenderer.showEdges(edgesToShow);
    }
    click(boardRenderer, renderer) {
        if (renderer instanceof EdgeRenderer) {
            this.ok(renderer.edge);            
        }
    }
    stop(boardRenderer) {
        boardRenderer.hideAllEdges();
        if (this.removeSubscription !== undefined) {
            this.removeSubscription();
        }
        this.player = null;
        this.boardRenderer = null;
        this.emphasizeHoveredObject = null;
    }
    enter(boardRenderer, renderer) {
        this.emphasizeHoveredObject.enter(boardRenderer, renderer);
    }
    leave(boardRenderer, renderer) {
        this.emphasizeHoveredObject.leave(boardRenderer, renderer);
    }
}
export class BuildTown extends BoardBehavior {
    constructor(player, keyListener, canCancel) {
        super();

        canCancel = canCancel || false;
        this.player = player;
        this.emphasizeHoveredObject = new EmphasizeHoveredObject(r => r instanceof NodeRenderer);
        
        this.promise = new Promise((ok, fail) => {
            this.ok = ok;
            this.fail = fail;
        });
        if (canCancel) {
            this.removeSubscription = keyListener.escape(() => this.fail(new Error("Cancelled building a new town")));
        }
    }
    start(boardRenderer) {
        this.boardRenderer = boardRenderer;
        var nodes = boardRenderer.board.getAllNodes();
        boardRenderer.showNodes(nodes);
    }
    click(boardRenderer, renderer) {
        if (renderer instanceof NodeRenderer) {
            this.ok(renderer.node);
        }
    }
    stop(boardRenderer) {
        boardRenderer.hideAllNodes();
        this.removeSubscription();
        this.promise = null;
        this.player = null;
        this.boardRenderer = null;
    }
    enter(boardRenderer, renderer) {
        this.emphasizeHoveredObject.enter(boardRenderer, renderer);
    }
    leave(boardRenderer, renderer) {
        this.emphasizeHoveredObject.leave(boardRenderer, renderer);
    }
}
export class BuildCity extends BoardBehavior {
    constructor(player, keyListener, canCancel) {
        super();

        canCancel = canCancel || false;
        this.player = player;
        this.emphasizeHoveredObject = new EmphasizeHoveredObject(r => r instanceof TownRenderer);
        
        this.promise = new Promise((ok, fail) => {
            this.ok = ok;
            this.fail = fail;
        });
        if (this.canCancel) {
            this.removeSubscription = keyListener.escape(() => this.fail(new Error("Cancelled building a new town")));
        }
    }
    start(boardRenderer) {
        this.boardRenderer = boardRenderer;
        // TODO: show nodeRenderers at eligible towns?
    }
    click(boardRenderer, renderer) {
        if (renderer instanceof TownRenderer) {
            this.ok(renderer.town.node);
        }
    }
    stop(boardRenderer) {
        boardRenderer.hideAllNodes();
        if (this.removeSubscription !== undefined) {
            this.removeSubscription();
        }
        this.promise = null;
        this.player = null;
        this.boardRenderer = null;
    }
    enter(boardRenderer, renderer) {
        this.emphasizeHoveredObject.enter(boardRenderer, renderer);
    }
    stop(boardRenderer, renderer) {
        this.emphasizeHoveredObject.leave(boardRenderer, renderer);
    }
}
export class ShowProduction extends BoardBehavior {
    constructor(keyListener, diceRoll) {
        super();
        this.diceRoll = diceRoll;

        this.promise = new Promise((ok, fail) => {
            this.ok = ok;
        });
        this.removeSubscription = keyListener.any(() => {
            this.ok();
        });
    }
    start(boardRenderer) {
        this.boardRenderer = boardRenderer;
        const board = boardRenderer.board;
        const affectedHexes = Array.from(board.hexes.values())
            .filter(h => h.chit.number !== null && 
                h.chit.number === this.diceRoll && 
                h.coord !== board.robber.coord);
        boardRenderer.lightenHexes(affectedHexes);
        const nonAffectedHexes = new Set(board.hexes.values());
        const robberHex = board.hexes.get(board.robber.coord);
        for (let affected of affectedHexes) {
            nonAffectedHexes.delete(affected);
        }
        if (robberHex.chit.number === this.diceRoll) {
            boardRenderer.redifyHexes([robberHex]);
            nonAffectedHexes.delete(robberHex);
        }
        boardRenderer.darkenHexes(nonAffectedHexes);
    }
    click(boardRenderer, renderer) {
        this.ok();
    }
    stop(boardRenderer, renderer) {
        this.boardRenderer.normalizeHexes(this.boardRenderer.board.hexes.values());
    }
}
export class MoveRobber extends BoardBehavior {
    constructor() {
        super();

        this.emphasizeHoveredHex = new EmphasizeHoveredObject(r => r instanceof HexRenderer);
        this.promise = new Promise((ok, fail) => {
            this.ok = ok;
            this.fail = fail;
        });
    }
    click(boardRenderer, renderer) {
        if (renderer instanceof HexRenderer) {
            const hex = renderer.hex;
            const coord = renderer.hex.coord;
            if (boardRenderer.board.robber.coord === coord) {
                return;
            }
            if (!hex.canHaveRobber) {
                return;
            }
            this.ok(coord);
        }
    }
    start(boardRenderer, renderer) {
        this.emphasizeHoveredHex.enter(boardRenderer, renderer);
        var all = Array.from(boardRenderer.board.hexes.values());
        const robberHex = boardRenderer.board.hexes.get(boardRenderer.board.robber.coord);
        var possible = all.filter(h => h.canHaveRobber && h.coord !== robberHex.coord);
        boardRenderer.redifyHexes([robberHex]);
        const notPossible = Util.except(all, possible);
        notPossible.remove(robberHex);
        boardRenderer.lightenHexes(possible);
        boardRenderer.darkenHexes(notPossible);
    }
    enter(boardRenderer, renderer) {
        this.emphasizeHoveredHex.enter(boardRenderer, renderer);
    }
    leave(boardRenderer, renderer) {
        this.emphasizeHoveredHex.leave(boardRenderer, renderer);
    }
    stop(boardRenderer) {
        boardRenderer.normalizeHexes(boardRenderer.board.hexes.values());
        this.ok = null;
        this.fail = null;
    }
}
export class PickPlayer extends BoardBehavior {
    constructor(opponents) {
        super();

        this.opponents = opponents;
        this.emphasizeHoveredHex = new EmphasizeHoveredObject((r => this.lightened.has(r)).bind(this));
        this.promise = new Promise((ok, fail) => {
            this.ok = ok;
            this.fail = fail;
        });
    }
    start(boardRenderer) {
        this.boardRenderer = boardRenderer;
        const board = boardRenderer.board;
        const opponentsSet = new Set(this.opponents);
        boardRenderer.darkenHexes(board.hexes.values());
        const toLighten = [];
        const toDarken = [];
        for (let [player, renderers] of boardRenderer.renderersForPlayer.entries()) {
            if (opponentsSet.has(player)) {
                toLighten.pushAll(renderers);
            } else {
                toDarken.pushAll(renderers);
            }
        }
        boardRenderer.darkenPieces(toDarken);
        boardRenderer.lightenPieces(toLighten);
        this.lightened = new Set(toLighten);
        this.darkened = new Set(toDarken);
    }
    click(boardRenderer, renderer) {
        if (this.lightened.has(renderer)) {
            this.ok(renderer.player);
        }
    }
    enter(boardRenderer, renderer) {
        this.emphasizeHoveredHex.enter(boardRenderer, renderer);
    }
    leave(boardRenderer, renderer) {
        this.emphasizeHoveredHex.leave(boardRenderer, renderer);
    }
    stop(boardRenderer) {
        boardRenderer.normalizePieces(this.lightened);
        boardRenderer.normalizePieces(this.darkened);
        boardRenderer.normalizeHexes(boardRenderer.board.hexes.values());
        this.ok = null;
        this.fail = null;
        this.emphasizeHoveredHex = null;
        this.lightened = null;
        this.darkened = null;
    }
}