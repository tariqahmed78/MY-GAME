namespace ArrowUntangle.Core
{
    /// <summary>
    /// Core application and screen states tying UI navigation and gameplay loop together.
    /// Boot → MainMenu → LevelSelect → Loading → Playing → Paused → Victory → Failure → Settings
    /// </summary>
    public enum GameState
    {
        Boot = 0,
        MainMenu = 1,
        LevelSelect = 2,
        Loading = 3,
        Playing = 4,
        Paused = 5,
        Victory = 6,
        Failure = 7,
        Settings = 8
    }
}
