import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface Room {
  id: string;
  number: string;
  type: string;
  status: string;
  price: number;
  capacity: number;
  amenities: string[];
}

export interface RoomFilter {
  status?: string;
  type?: string;
  capacity?: number;
  priceRange?: { min: number; max: number };
}

export class RoomManagementPage extends BasePage {
  readonly roomsContainer: Locator;
  readonly roomGrid: Locator;
  readonly roomCards: Locator;
  readonly addRoomButton: Locator;
  readonly searchInput: Locator;
  readonly statusFilter: Locator;
  readonly typeFilter: Locator;
  readonly capacityFilter: Locator;
  readonly priceFilter: Locator;
  readonly sortBy: Locator;
  readonly refreshButton: Locator;
  readonly roomModal: Locator;
  readonly roomForm: Locator;
  readonly deleteConfirmModal: Locator;
  readonly bulkActionsToolbar: Locator;

  constructor(page: Page) {
    super(page);
    this.roomsContainer = page.locator('[data-testid="rooms-container"]');
    this.roomGrid = page.locator('[data-testid="rooms-grid"]');
    this.roomCards = page.locator('[data-testid="room-card"]');
    this.addRoomButton = page.locator('[data-testid="add-room-btn"]');
    this.searchInput = page.locator('[data-testid="room-search"]');
    this.statusFilter = page.locator('[data-testid="status-filter"]');
    this.typeFilter = page.locator('[data-testid="type-filter"]');
    this.capacityFilter = page.locator('[data-testid="capacity-filter"]');
    this.priceFilter = page.locator('[data-testid="price-filter"]');
    this.sortBy = page.locator('[data-testid="sort-by"]');
    this.refreshButton = page.locator('[data-testid="refresh-rooms"]');
    this.roomModal = page.locator('[data-testid="room-modal"]');
    this.roomForm = page.locator('[data-testid="room-form"]');
    this.deleteConfirmModal = page.locator('[data-testid="delete-confirm-modal"]');
    this.bulkActionsToolbar = page.locator('[data-testid="bulk-actions-toolbar"]');
  }

  async navigateTo(): Promise<void> {
    await this.page.goto('/hotel-admin/rooms');
    await this.waitForPageLoad();
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.roomsContainer).toBeVisible();
    await expect(this.addRoomButton).toBeVisible();
  }

  async getTotalRooms(): Promise<number> {
    const rooms = await this.roomCards.count();
    return rooms;
  }

  async searchRooms(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.waitForPageLoad();
  }

  async filterByStatus(status: string): Promise<void> {
    await this.statusFilter.selectOption(status);
    await this.waitForPageLoad();
  }

  async filterByType(type: string): Promise<void> {
    await this.typeFilter.selectOption(type);
    await this.waitForPageLoad();
  }

  async filterByCapacity(capacity: number): Promise<void> {
    await this.capacityFilter.selectOption(capacity.toString());
    await this.waitForPageLoad();
  }

  async applyPriceFilter(min: number, max: number): Promise<void> {
    const minInput = this.priceFilter.locator('input[name="minPrice"]');
    const maxInput = this.priceFilter.locator('input[name="maxPrice"]');
    const applyButton = this.priceFilter.locator('button[type="submit"]');

    await minInput.fill(min.toString());
    await maxInput.fill(max.toString());
    await applyButton.click();
    await this.waitForPageLoad();
  }

  async sortRooms(sortBy: string): Promise<void> {
    await this.sortBy.selectOption(sortBy);
    await this.waitForPageLoad();
  }

  async refreshList(): Promise<void> {
    await this.refreshButton.click();
    await this.waitForPageLoad();
  }

  async addRoom(roomData: Partial<Room>): Promise<void> {
    await this.addRoomButton.click();
    await expect(this.roomModal).toBeVisible();

    // Fill room form
    if (roomData.number) {
      await this.roomForm.locator('input[name="number"]').fill(roomData.number);
    }
    if (roomData.type) {
      await this.roomForm.locator('select[name="type"]').selectOption(roomData.type);
    }
    if (roomData.capacity) {
      await this.roomForm.locator('input[name="capacity"]').fill(roomData.capacity.toString());
    }
    if (roomData.price) {
      await this.roomForm.locator('input[name="price"]').fill(roomData.price.toString());
    }

    // Add amenities
    if (roomData.amenities) {
      for (const amenity of roomData.amenities) {
        await this.roomForm.locator(`input[name="amenities"][value="${amenity}"]`).check();
      }
    }

    // Submit form
    await this.roomForm.locator('button[type="submit"]').click();
    await expect(this.roomModal).not.toBeVisible();
    await this.waitForPageLoad();
  }

  async editRoom(roomNumber: string, updates: Partial<Room>): Promise<void> {
    const roomCard = this.getRoomCard(roomNumber);
    const editButton = roomCard.locator('[data-testid="edit-room-btn"]');
    
    await editButton.click();
    await expect(this.roomModal).toBeVisible();

    // Update fields
    if (updates.type) {
      await this.roomForm.locator('select[name="type"]').selectOption(updates.type);
    }
    if (updates.capacity) {
      await this.roomForm.locator('input[name="capacity"]').fill(updates.capacity.toString());
    }
    if (updates.price) {
      await this.roomForm.locator('input[name="price"]').fill(updates.price.toString());
    }

    // Submit form
    await this.roomForm.locator('button[type="submit"]').click();
    await expect(this.roomModal).not.toBeVisible();
    await this.waitForPageLoad();
  }

  async deleteRoom(roomNumber: string): Promise<void> {
    const roomCard = this.getRoomCard(roomNumber);
    const deleteButton = roomCard.locator('[data-testid="delete-room-btn"]');
    
    await deleteButton.click();
    await expect(this.deleteConfirmModal).toBeVisible();
    
    const confirmButton = this.deleteConfirmModal.locator('[data-testid="confirm-delete"]');
    await confirmButton.click();
    
    await expect(this.deleteConfirmModal).not.toBeVisible();
    await this.waitForPageLoad();
  }

  async updateRoomStatus(roomNumber: string, status: string): Promise<void> {
    const roomCard = this.getRoomCard(roomNumber);
    const statusDropdown = roomCard.locator('[data-testid="room-status-select"]');
    
    await statusDropdown.selectOption(status);
    await this.waitForPageLoad();
  }

  async bulkUpdateStatus(roomNumbers: string[], status: string): Promise<void> {
    // Select rooms
    for (const roomNumber of roomNumbers) {
      const roomCard = this.getRoomCard(roomNumber);
      const checkbox = roomCard.locator('input[type="checkbox"]');
      await checkbox.check();
    }

    await expect(this.bulkActionsToolbar).toBeVisible();
    
    const bulkStatusSelect = this.bulkActionsToolbar.locator('[data-testid="bulk-status-select"]');
    await bulkStatusSelect.selectOption(status);
    
    const applyButton = this.bulkActionsToolbar.locator('[data-testid="apply-bulk-action"]');
    await applyButton.click();
    
    await this.waitForPageLoad();
  }

  async getRoomDetails(roomNumber: string): Promise<Room | null> {
    const roomCard = this.getRoomCard(roomNumber);
    
    if (!(await roomCard.isVisible())) {
      return null;
    }

    const number = await roomCard.locator('[data-testid="room-number"]').textContent();
    const type = await roomCard.locator('[data-testid="room-type"]').textContent();
    const status = await roomCard.locator('[data-testid="room-status"]').textContent();
    const priceText = await roomCard.locator('[data-testid="room-price"]').textContent();
    const capacityText = await roomCard.locator('[data-testid="room-capacity"]').textContent();
    
    const price = parseFloat(priceText?.replace(/[^0-9.-]/g, '') || '0');
    const capacity = parseInt(capacityText?.replace(/[^0-9]/g, '') || '0');
    
    const amenitiesElements = await roomCard.locator('[data-testid="room-amenity"]').allTextContents();

    return {
      id: `room-${roomNumber}`,
      number: number || '',
      type: type || '',
      status: status || '',
      price,
      capacity,
      amenities: amenitiesElements
    };
  }

  async verifyRoomExists(roomNumber: string): Promise<boolean> {
    const roomCard = this.getRoomCard(roomNumber);
    return await roomCard.isVisible();
  }

  async getRoomsByStatus(status: string): Promise<string[]> {
    await this.filterByStatus(status);
    
    const roomNumbers = await this.roomCards
      .locator('[data-testid="room-number"]')
      .allTextContents();
    
    return roomNumbers;
  }

  async exportRoomsData(): Promise<void> {
    const exportButton = this.page.locator('[data-testid="export-rooms"]');
    await exportButton.click();
    
    // Wait for download
    await this.page.waitForTimeout(1000);
  }

  private getRoomCard(roomNumber: string): Locator {
    return this.roomCards.filter({
      has: this.page.locator(`[data-testid="room-number"]:has-text("${roomNumber}")`)
    });
  }

  async switchToListView(): Promise<void> {
    const listViewButton = this.page.locator('[data-testid="list-view-btn"]');
    await listViewButton.click();
    await this.waitForPageLoad();
  }

  async switchToGridView(): Promise<void> {
    const gridViewButton = this.page.locator('[data-testid="grid-view-btn"]');
    await gridViewButton.click();
    await this.waitForPageLoad();
  }

  async uploadRoomImages(roomNumber: string, imagePaths: string[]): Promise<void> {
    const roomCard = this.getRoomCard(roomNumber);
    const uploadButton = roomCard.locator('[data-testid="upload-images-btn"]');
    
    await uploadButton.click();
    
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(imagePaths);
    
    const uploadConfirmButton = this.page.locator('[data-testid="confirm-upload"]');
    await uploadConfirmButton.click();
    
    await this.waitForPageLoad();
  }
}
