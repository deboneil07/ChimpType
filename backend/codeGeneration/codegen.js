function getRandomCodeBlock() {
  const codeBlocks = [
    {
      language: "Python",
      code: `
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

print(factorial(5))
      `.trim(),
    },
    {
      language: "JavaScript",
      code: `
function isPalindrome(str) {
    const clean = str.toLowerCase().replace(/[^a-z]/g, '');
    return clean === clean.split('').reverse().join('');
}

console.log(isPalindrome("Racecar"));
      `.trim(),
    },
    {
      language: "C++",
      code: `
#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 5; ++i)
        cout << "Hello " << i << endl;
    return 0;
}
      `.trim(),
    },
    {
      language: "Go",
      code: `
package main

import "fmt"

func main() {
    for i := 1; i <= 5; i++ {
        fmt.Println("Line", i)
    }
}
      `.trim(),
    },
    {
      language: "Java",
      code: `
public class HelloWorld {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            System.out.println("Java says hello " + i);
        }
    }
}
      `.trim(),
    },
    {
      language: "Rust",
      code: `
fn main() {
    for i in 1..=5 {
        println!("Rust line number: {}", i);
    }
}
      `.trim(),
    },
    {
      language: "Ruby",
      code: `
5.times do |i|
  puts "Ruby magic \#{i + 1}"
end

puts "Done looping!"
      `.trim(),
    },
  ];

  return codeBlocks[Math.floor(Math.random() * codeBlocks.length)];
  // pusher.trigger(`${roomId}`, "code-block", {
  //   randomBlock
  // })
}


module.exports = getRandomCodeBlock;