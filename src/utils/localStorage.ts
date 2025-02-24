const getImageFilename = (productName: string): string => {
  const normalizedName = productName.toLowerCase().trim();

  const imageMap: { [key: string]: string } = {
    "black t-shirt": "black-ts.png",
    "go for the b/g t-shirt": "blue-gold-ts.png",
    "hydro coffee": "hydro-coffee.png",
    "plastic water bottle": "plastic-water-bottle.png",
    "sports bag": "sports-bag.png",
    "tote bag": "tote-bag.png",
    "tourism suit": "tourism-suit.png",
    "traditional female polo for shs": "traditional-female-shs.png",
    "traditional polo for female": "traditional-female.png",
    "traditional male polo for shs": "traditional-male-shs.png",
    "traditional polo for male": "traditional-male.png",
    tumbler: "tumbler.png",
    "white t-shirt": "white-ts.png",
  };

  return imageMap[normalizedName] || "default.png";
};

export default getImageFilename;
