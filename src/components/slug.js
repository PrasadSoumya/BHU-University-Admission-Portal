export function generateSlug(title) {
    const slug = title
      .toLowerCase()             
      .replace(/[^\w\s-]/g, '')  
      .trim()                    
      .replace(/\s+/g, '-')      
      .slice(0, 100);             
    return slug;
  }


 export function capitalizeAndJoin(inputString) {
  if (typeof inputString !== 'string' || inputString.length === 0) {
    console.error("Input must be a non-empty string.");
    return "";
  }

  const words = inputString.split('-');

  const formattedWords = words.map(word => {
    if (word.length > 0) {
      return word[0].toUpperCase() + word.slice(1);
    }
    return "";
  });

  return formattedWords.join(' ');
} 