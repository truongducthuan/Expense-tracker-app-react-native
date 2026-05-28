export const formatAmount = (amount) => {
  if(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  return 0;
};

export const formatInput = (e) => {
  let result;
    let input = e.replace(/\./g, '');
    input = input.replace(/\D/g, '')
    if (input.length > 3) {
      let formattedInput = input.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      result = formattedInput;
  } else {
    result = input;
  };
  return result;
}

export const checkFormat = (data) => {
  if(data >= 10) {
    return data
  } else {
    return `0${data}`
  }
}
