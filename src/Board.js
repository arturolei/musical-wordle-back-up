import React, { useEffect, useState, useCallback } from "react";
import styles from "./Board.module.css";
import playSequence from "./helpers/playSequence";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

function Board({ answer }) {
    const [guess, setGuess] = useState(new Array(6).fill(""));
    const [currentRow, setCurrentRow] = useState(0);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        const answerStr = answer.sequence
            .map(noteCluster => noteCluster.split('')[0])
            .join('');

        const guessStr = guess[currentRow];
        if (guessStr === answerStr) {
            playSequence(answer, guess, currentRow);
            document
                .querySelectorAll(`input[name^="note-${currentRow}"]`)
                .forEach((el) => (el.style.background = "#538d4e"));
            setMessage("Congratulations!");
            setError("")
        } else if (guessStr.length < 6) {
            setError("Please fill out all the notes.");
            return;
        } else {
            /*If user has submitted 6 notes, play the notes when they submit*/
            playSequence(answer, guess, currentRow);
            /*Increment the row*/
            setCurrentRow(currentRow + 1);
            setError("Please try again");
        }
        for (let i = 0; i < guessStr.length; i++) {
            if (guessStr[i] === answerStr[i]) {
                document.querySelector(
                    `input[name="note-${currentRow}-${i}"]`
                ).style.background = "#538d4e";
                document.querySelector(
                    `input[name="note-${currentRow}-${i}"]`
                ).style.color = "white";

            } else if (answerStr.includes(guessStr[i])) {
                document.querySelector(
                    `input[name="note-${currentRow}-${i}"]`
                ).style.background = "#c9b458";
                
                document.querySelector(
                    `input[name="note-${currentRow}-${i}"]`
                ).style.color = "white";
            }
        }
    }, [answer, currentRow, guess]);

    useEffect(() => {
        function handleKeyDown(event) {
            switch (true) {
                case event.key === "Backspace":
                    /*Updated guess state after backspace*/
                    const updatedGuess = guess.map((guessStr, i) => {
                        if (i === currentRow) {
                            return guessStr.slice(0, guessStr.length - 1);
                        } else {
                            return guessStr;
                        }
                    });
                    setGuess(updatedGuess);
                    setError("");
                    break;
                case isNote(event.key):
                    /*Update guess state after valid note*/
                    if (guess[currentRow].length < 6) {
                        setGuess(
                            guess.map((guessStr, i) => {
                                if (i === currentRow) {
                                    return guessStr + event.key.toUpperCase();
                                } else {
                                    return guessStr;
                                }
                            })
                        );
                    }
                    setError("");
                    break;
                case event.key === "Enter":
                    handleSubmit(event);
                    break;
                case RegExp("^[a-zA-Z0-9]$").test(event.key):
                    setError(`${event.key.toUpperCase()} is not a valid note.`);
                    break;
                default:
                    break;
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [guess, currentRow, handleSubmit]);

    function isNote(str) {
        return str.length === 1 && "abcdefg".includes(str.toLowerCase());
    }

    return (
        <>
            <p>Guess: {JSON.stringify(guess)}</p>
            <p>Answer: {JSON.stringify(answer)}</p>
            <form className={styles.board} onSubmit={handleSubmit}>
                {guess.map((char, row) => {
                    return (
                        <div key={row}>
                            {[0, 1, 2, 3, 4, 5].map((column) => {
                                return (<input
                                    key={column}
                                    type="text"
                                    name={`note-${row}-${column}`}
                                    disabled={currentRow !== row}
                                    maxLength={1}
                                    value={guess[row][column] || ""}
                                    tabIndex={-1}
                                    readOnly
                                />)
                            })}
                            <button onClick={(e) => { e.preventDefault(); playSequence(answer, guess, row) }}>
                                <FontAwesomeIcon icon={faPlay} />
                            </button>
                        </div>
                    )
                })}
                <button type="submit">Submit</button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
            {message && message}
        </>
    );
}

export default Board;
