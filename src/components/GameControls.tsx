export const GameControls = ({
  isRunning,
  isStopped,
  onStart,
  onStop,
  onContinue,
  onQuit,
}: {
  isRunning: boolean;
  isStopped: boolean;
  onStart: () => void;
  onStop: () => void;
  onContinue: () => void;
  onQuit: () => void;
}) => {
  const pauseButton = isStopped ? (
    <button className="board-button tile control-button" onClick={onContinue}>
      Pokračovat
    </button>
  ) : (
    <button className="board-button tile control-button" onClick={onStop} disabled={!isRunning}>
      Pauza
    </button>
  );

  const newGameButton = isRunning || isStopped ? (
    <button className="board-button tile control-button" onClick={onQuit}>
      Ukončit hru
    </button>
  ) : (
    <button className="board-button tile control-button" onClick={onStart}>
      Nová hra
    </button>
  );

  return (
    <div className='control-buttons'>
      {newGameButton}
      {pauseButton}
    </div>
  );
};