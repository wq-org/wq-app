import GameLayout from '@/components/layout/GameLayout';

export default function ImagePinMarkGame() {
  const editorContent = (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Image Pin Mark Game</h2>
      <p className="text-gray-600">
        User gets an image and pin or mark areas what he thinks is correct or wrong.
        <br />
        TODO: Implement the game logic here.
      </p>
    </div>
  );

  const previewContent = (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Preview</h2>
      <p className="text-gray-600">Game preview will appear here.</p>
    </div>
  );

  const settingsContent = (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <p className="text-gray-600">Game settings will appear here.</p>
    </div>
  );

  return (
    <GameLayout
      editorContent={editorContent}
      previewContent={previewContent}
      settingsContent={settingsContent}
    />
  );
}

