function checkWordValidity(word) {
  return fetch("https://api.api-ninjas.com/v1/dictionary?word=" + word, {
    headers: {
      "X-Api-Key": "yd6ElLtR6oE2QUrhS5pt6w==IZfTQ4nYiCx1Cfjz",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.valid) {
        console.log("True, it is in the dictionary.");
      } else {
        console.log("False, it isn't in the dictionary.");
      }
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error,
      );
      console.log("False, it isn't in the dictionary.");
    });
}

// Check the word 'apple'
checkWordValidity("applerrr");
