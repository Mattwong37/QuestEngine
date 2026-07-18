import { TestBed } from '@angular/core/testing';

import { GameService } from './game';
import { StoryService } from './story';
import { EquipmentItem } from '../models/story.model';

describe('Game', () => {
  let service: GameService;
  let storyService: StoryService;

  beforeEach(() => {
    localStorage.clear(); 
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    storyService = TestBed.inject(StoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('player setup', () => {
      service.initPlayer('Matt');
      expect(service.player().name).toBe('Matt');
      expect(service.playerName()).toBe('Matt');
    });

    it('default state check', () => {
      const p = service.player();
      expect(p.name).toBe('');
      expect(p.level).toBe(1);
      expect(p.xp).toBe(0);
      expect(p.xpToNextLevel).toBe(100);
      expect(p.maxHealth).toBe(100);
      expect(p.currentHealth).toBe(100);
      expect(p.maxMagic).toBe(100);
      expect(p.currentMagic).toBe(100);
      expect(p.stamina).toBe(100);
      expect(p.equipment).toEqual({ mainHand: null, offHand: null, shoes: null, armor: null });
      expect(p.inventory).toEqual([]);
      expect(p.activeModifiers).toEqual([]);
      expect(p.choiceHistory).toEqual([]);
      expect(service.saveSlots()).toEqual([]);
    });

    it('load existing save', () => {
      const weapon: EquipmentItem = {
        id: 'sword1',
        name: 'Test Sword',
        slot: 'mainHand',
        bonus: { attackMinBonus: 1, attackMaxBonus: 2 },
      };

      const existingSaves = [
        { id: 1, name: 'SaveSlot1', timestamp: 1, playerName: 'Matt', scenePreview: 'Green grass and trees', data: {} }, 
        { id: 2, name: 'SaveSlot2', timestamp: 1, playerName: 'Matt', scenePreview: 'Green grass and trees', data: 
          {player: {
            name: 'Matt',
            level: 2,
            xp: 10,
            xpToNextLevel: 101,
            maxHealth: 102,
            currentHealth: 103,
            maxMagic: 104,
            currentMagic: 105,
            defense: 106,
            magicDefense: 107,
            attackMin: 1,
            attackMax: 3,
            stamina: 88,
            equipment: { mainHand: weapon, offHand: null, shoes: null, armor: null },
            inventory: [],
            activeModifiers: [],
            choiceHistory: ['Choice1'],
            },
            conversationHistory: [
              { role: 'user', content: "The player's name is Matt. Begin the isekai story." },
              { role: 'assistant', content: '{"sceneText":"Matt wakes in a forest.","choices":[\'Choice1\', \'Choice2\', \'Choice3\']}' },
              { role: 'user', content: 'Player chose: Choice1' },
              { role: 'assistant', content: '{"sceneText":"Matt enters a cave","choices":[\'Choice5\', \'Choice6\', \'Choice7\']}' },
            ],
            history: [
              { sceneText: 'Matt wakes up in a forest', imageUrl: '', choiceMade: 'Choice1', imagePrompt: 'Testing Image Prompt1' },
              { sceneText: 'Matt enters a cave', imageUrl: '', choiceMade: '', imagePrompt: 'Testing Image Prompt2' }
            ],
            characterRegistry: { protagonist: 'adventurer' },
            currentCardIndex: 0,
            currentChoices: [{ id: '1', text: 'Choice1' }],
          }
        }
      ];

      localStorage.setItem('quest_engine_saves', JSON.stringify(existingSaves));
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newGameService = TestBed.inject(GameService);
      const loadedSave = newGameService.saveSlots()[1];

      expect(newGameService.saveSlots().length).toBe(2);
      expect(loadedSave.playerName).toBe('Matt');
      expect(loadedSave.data.player.name).toBe('Matt');
      expect(loadedSave.data.player.level).toBe(2);
      expect(loadedSave.data.player.xp).toBe(10);
      expect(loadedSave.data.player.xpToNextLevel).toBe(101);
      expect(loadedSave.data.player.maxHealth).toBe(102);
      expect(loadedSave.data.player.currentHealth).toBe(103);
      expect(loadedSave.data.player.maxMagic).toBe(104);
      expect(loadedSave.data.player.currentMagic).toBe(105);
      expect(loadedSave.data.player.defense).toBe(106);
      expect(loadedSave.data.player.magicDefense).toBe(107);
      expect(loadedSave.data.player.attackMin).toBe(1);
      expect(loadedSave.data.player.attackMax).toBe(3);
      expect(loadedSave.data.player.stamina).toBe(88);

      expect(loadedSave.data.player.choiceHistory.length).toBe(1);
      expect(loadedSave.data.player.choiceHistory).toEqual(['Choice1']);
      expect(loadedSave.data.player.equipment.mainHand?.name).toBe('Test Sword');
      expect(loadedSave.data.player.equipment.mainHand?.bonus.attackMaxBonus).toBe(2);
      expect(loadedSave.data.player.equipment.mainHand?.bonus.attackMinBonus).toBe(1);
    });
  });

  describe('saving manipulating', () => {
    it('create a new save slot and stored in localStorage', () => {
      service.initPlayer('Matt');
      service.saveGame(1, 'Test Save');

      const slots = service.saveSlots();
      expect(slots.length).toBe(1);
      expect(slots[0].id).toBe(1);
      expect(slots[0].name).toBe('Test Save');
      expect(slots[0].playerName).toBe('Matt');

      const stored = JSON.parse(localStorage.getItem('quest_engine_saves')!);
      expect(stored.length).toBe(1);
      expect(stored[0].id).toBe(1);
    });

    it('save overwrite and two saves', () => {
      const weapon: EquipmentItem = {
        id: 'sword1',
        name: 'Test Sword',
        slot: 'mainHand',
        bonus: { attackMinBonus: 1, attackMaxBonus: 2 },
      };

      // Freezes time at specific values since timestamp wasn't calculating properly
      vi.spyOn(Date, 'now').mockReturnValue(1000);
      
      service.initPlayer('Matt');
      storyService.history.set([
        { sceneText: 'Matt wakes in a forest.', imageUrl: '', choiceMade: '', imagePrompt: '' },
      ]);

      service.saveGame(1, 'TestSave1');

      var saveSlot = service.saveSlots()[0];
      expect(saveSlot.timestamp).toBe(1000);
      expect(saveSlot.data.player.level).toBe(1);
      expect(saveSlot.data.player.equipment.mainHand).toBeNull();

      vi.spyOn(Date, 'now').mockReturnValue(2000);
      service.equipItem(weapon);
      storyService.history.set([
        { sceneText: 'Matt wakes in a forest.', imageUrl: '', choiceMade: 'Explore north', imagePrompt: '' },
        { sceneText: 'Matt finds a cave.', imageUrl: '', choiceMade: '', imagePrompt: '' },
      ]);

      console.log('saveSlots:', JSON.stringify(service.saveSlots().map(s => ({ id: s.id, name: s.name })), null, 2));
      service.saveGame(1, 'TestSave1-Overwrite');
      saveSlot = service.saveSlots()[0];
      expect(service.saveSlots().length).toBe(1);
      expect(saveSlot.timestamp).toBe(2000);
      expect(saveSlot.data.player.level).toBe(1);
      expect(saveSlot.data.player.equipment.mainHand?.name).toBe('Test Sword');

      // Makes sure that save 1 wasn't overwritten
      service.saveGame(2, 'TestSave2');

      saveSlot = service.saveSlots().find(s => s.id === 1)!;
      expect(service.saveSlots().length).toBe(2);
      expect(saveSlot.timestamp).toBe(2000);
      expect(saveSlot.data.player.level).toBe(1);
      expect(saveSlot.data.player.equipment.mainHand?.name).toBe('Test Sword');
    });

    it('create multiple saves', () => {
      service.saveGame(1, 'TestSave1');
      service.saveGame(2, 'TestSave2');

      expect(service.saveSlots().length).toBe(2);
      expect(service.saveSlots().map(s => s.id).sort()).toEqual([1, 2]);
    });
  });

});