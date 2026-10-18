// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import unclickedUrl from "./assets/unclickedCat.svg?no-inline";
import clickedUrl from "./assets/clickedCat.svg?no-inline";

const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "D1 project";

const image = document.createElement("img");
image.src = unclickedUrl;
image.alt = "A calico cat";
image.width = 96;
image.height = 96;

// Make the image respond to clicks.
image.style.cursor = "pointer";

// Change the image's appearance while the mouse is pressed.
image.addEventListener("mousedown", () => {
  image.src = clickedUrl;
});

// Restore the original appearance when the mouse is released.
image.addEventListener("mouseup", () => {
  image.src = unclickedUrl;
});

let count = 0; //currency count
let clickValue = 1; //the amount of currency gained per click
let total = 1; //total production rate, starts at 1 click per second

//create elements to display the current count, total production, and click value
const counter = document.createElement("p");
const productionDisplay = document.createElement("p");
const clickValueDisplay = document.createElement("p");

image.addEventListener("click", () => { //Behavior when button is clicked
  console.log("Image clicked!");
  count = count + clickValue; //increment count when clicked
  updateProductionDisplays(); //update displays with new values
});

function updateProductionDisplays() { // Updates displays with current values of count, total production, and click value.
  counter.textContent = `Fish: ${Math.floor(count)}`;
  productionDisplay.textContent = `Fish per second: ${total}`;
  clickValueDisplay.textContent = `Fish each click: ${clickValue}`;
}

let previousTime: number | undefined; //will store the previous frame's timestamp, starts undefined

function update(timestamp: number) {
  if (previousTime !== undefined) { //check whether a previous timestamp exists
    const elapsedSeconds = (timestamp - previousTime) / 1000; //find time since previous frame in seconds

    count = count + total * elapsedSeconds; //increase count based on amount of time as passed. Will start at 1/ sec
    updateProductionDisplays(); //update displays with new values
  }

  previousTime = timestamp; //update previous time based on time passed
  requestAnimationFrame(update);
}

const upgradeContainer = document.createElement("div"); //create container to display upgrade buttons
upgradeContainer.style.display = "grid";
upgradeContainer.style.gridTemplateColumns = "200px 200px 200px 200px 200px";
upgradeContainer.style.gap = "15px";

class Upgrade {
  name: string;
  cost: number;
  button: HTMLButtonElement;

  constructor(
    name: string,
    cost: number,
    container: HTMLDivElement,
  ) {
    this.name = name;
    this.cost = cost;

    this.button = document.createElement("button");
    this.button.style.whiteSpace = "pre-line";
    this.button.style.width = "200px";
    this.button.title =
      `title needs to be replaced with flavor text in ${this.name}`;
    container.append(this.button);

    this.button.addEventListener("click", () => {
      if (count >= this.cost) {
        this.buyUpgrade();
        updateProductionDisplays();
      }
    });
  }

  //accessing parts of the class directly to change them felt kind of wrong, so I made this a method instead
  setHoverText(text: string) {
    this.button.title = text;
  }

  buyUpgrade() {
    throw new Error(
      `buyUpgrade() needs to be defined in ${this.name}`,
    );
  }
}

class HelperUpgrade extends Upgrade {
  rateAdd: number;
  numOwned: number;

  constructor(name: string, cost: number, rateAdd: number) {
    super(name, cost, upgradeContainer);
    this.rateAdd = rateAdd;
    this.numOwned = 0;
    this.updateButtonText();
  }

  override buyUpgrade(): void {
    count -= this.cost;
    total += this.rateAdd;
    this.numOwned++;
    this.cost *= 2;
    this.updateButtonText();
  }

  updateButtonText() {
    this.button.textContent = `${this.name}
      Cost: ${this.cost}
      Owned: ${this.numOwned}
      Each ${this.name} adds ${this.rateAdd} fish per second`;
  }
}

class UpgradeForUpgrade extends Upgrade {
  mult: number;
  upgrade: HelperUpgrade;
  numUpgradeNeeded: number;
  purchased: boolean;

  constructor(
    name: string,
    cost: number,
    container: HTMLDivElement,
    mult: number,
    upgrade: HelperUpgrade,
    numUpgradeNeeded: number,
  ) {
    super(name, cost, container);
    this.mult = mult;
    this.upgrade = upgrade;
    this.numUpgradeNeeded = numUpgradeNeeded;
    this.purchased = false;
    this.button.textContent = `${this.name}
    Cost: ${this.cost}
    You need ${numUpgradeNeeded} ${this.upgrade.name}s to buy this upgrade`;
  }

  override buyUpgrade(): void {
    if (
      (this.purchased == false) &&
      (this.upgrade.numOwned >= this.numUpgradeNeeded)
    ) {
      count -= this.cost;
      total += this.upgrade.rateAdd * this.upgrade.numOwned * (this.mult - 1);
      this.upgrade.rateAdd = this.upgrade.rateAdd * this.mult;
      this.upgrade.updateButtonText();
      this.button.textContent = `${this.name}
      SOLD OUT`;
      this.setHoverText("You already have this upgrade!");
      this.purchased = true;
    }
  }
}

class UpgradeForClick extends Upgrade {
  rateAdd: number;
  constructor(
    name: string,
    cost: number,
    container: HTMLDivElement,
    rateAdd: number,
  ) {
    super(name, cost, container);
    this.rateAdd = rateAdd;
    this.button.textContent = `${this.name}
    Cost: ${this.cost}`;
  }

  override buyUpgrade(): void {
    count -= this.cost;
    clickValue += this.rateAdd;
    updateProductionDisplays();
    this.button.textContent = "SOLD OUT";
    this.setHoverText("You already have this upgrade!");
  }
}

const fishercat: HelperUpgrade = new HelperUpgrade("Fisher Cat", 10, 1);
fishercat.setHoverText(
  "Fisher Cats are cats that you can hire to fish for you...For the right price, of course.",
);

const farmercat: HelperUpgrade = new HelperUpgrade("Farmer Cat", 25, 5);
farmercat.setHoverText(
  "Fish enthusiasts turned breeders, Farmer Cats own ponds of exotic fish and will happily give you some of the ones that are not up to their aesthetic standards if you provide some first.",
);

const wizardcat: HelperUpgrade = new HelperUpgrade("Wizard Cat", 100, 20);
wizardcat.setHoverText(
  "Wizard Cats are former familiars who decided to take up the study of magic themselves, mostly because they wanted to summon portals to dimensions with more fish. They'll agree to give you some of these otherwordly fish if you provide the supplies for their spells.",
);

const scientistcat: HelperUpgrade = new HelperUpgrade(
  "Scientist Cat",
  1000,
  50,
);
scientistcat.setHoverText(
  "Scientist Cats have dedicated their lives to the pursuit of knowledge...on how to best clone fish. Due to the fact that the subjects of their research often get eaten before any meaningful analysis can be done, they've struggled to get grants. They're willing to share some of their cloned fish if you fund their research efforts.",
);

const climbingcat: HelperUpgrade = new HelperUpgrade(
  "Climbing Cat",
  250,
  35,
);

climbingcat.setHoverText(
  "Climbing Cats are adventurous hunters who climb tall trees to catch fish-loving birds and discover hidden fish supplies. Give them some fish, and they'll bring back even more!",
);
const clickUpgrade1: UpgradeForClick = new UpgradeForClick(
  "Sharper Claws",
  500,
  upgradeContainer,
  1,
);
clickUpgrade1.setHoverText(
  "Your cat has scratched the number '500' into the wall of your bedroom and has left a dead fish lying on the floor beneath the message. After noticing you staring at the bizarre scene, your cat skips away and comes back with a sharpening stone. She looks between you, the wall, and her paws, and meows. Her message is clear: if you give me 500 fish, I'll sharpen my claws so I can catch fish better.",
);

const fishingUpgrade1: UpgradeForUpgrade = new UpgradeForUpgrade(
  "Metal fishing rods",
  20,
  upgradeContainer,
  2,
  fishercat,
  2,
);
fishingUpgrade1.setHoverText(
  "The Fisher Cats fish with shoddy wooden rods. Every now and again, you see them look over at someone using a metal fishing rod.",
);

const farmingUpgrade1: UpgradeForUpgrade = new UpgradeForUpgrade(
  "Extra Fish Food",
  50,
  upgradeContainer,
  2,
  farmercat,
  2,
);
farmingUpgrade1.setHoverText(
  "Some fish can be tricked into thinking its breeding season by mimicking the changing of the seasons. Giving the fish more food and heating the water can trick them into thinking that spring has come.",
);

const magicUpgrade1: UpgradeForUpgrade = new UpgradeForUpgrade(
  "New Wands",
  200,
  upgradeContainer,
  2,
  wizardcat,
  2,
);
magicUpgrade1.setHoverText(
  "Despite the fact that the Wizard Cats have grown accustomed to using hand-me-down magic supplies, the old wands still only work partially, leading to spells failing.",
);

const scienceUpgrade1: UpgradeForUpgrade = new UpgradeForUpgrade(
  "Coffee",
  2000,
  upgradeContainer,
  2,
  scientistcat,
  2,
);
scienceUpgrade1.setHoverText(
  "The cats, despite being scientists, are still cats and sleep quite a bit. You think their productivity could increase if you gave them some coffee.",
);

const catTree: UpgradeForUpgrade = new UpgradeForUpgrade(
  "Cat Tree",
  500,
  upgradeContainer,
  2,
  climbingcat,
  2,
);
catTree.setHoverText(
  "Do you know cat like to climb because in the wild cat climb up and eat their prey above tree",
);

const clickUpgrade2: UpgradeForClick = new UpgradeForClick(
  "New Friends",
  1000,
  upgradeContainer,
  3,
);
clickUpgrade2.setHoverText(
  "Your cat has been hanging around with other cats in the neighborhood lately. You wonder if they'll help catch fish too if you give them some fish.",
);
app.append(
  heading,
  image,
  counter,
  productionDisplay,
  clickValueDisplay,
  upgradeContainer,
);

requestAnimationFrame(update);
updateProductionDisplays();
